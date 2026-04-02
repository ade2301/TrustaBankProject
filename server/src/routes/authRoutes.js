import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { Router } from 'express'
import argon2 from 'argon2'
import { requireAuth } from '../middleware/auth.js'
import User from '../models/User.js'
import { createUniqueAccountNumber } from '../utils/accountNumber.js'
import { sendLoginOtpEmail } from '../utils/mailer.js'
import { authCookieOptions, signToken, verifyToken } from '../utils/token.js'

const router = Router()

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_RULES = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
const OTP_EXPIRES_MINUTES = Number(process.env.OTP_EXPIRES_MINUTES || 10)
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5)
const LOGIN_MAX_ATTEMPTS = Number(process.env.LOGIN_MAX_ATTEMPTS || 5)
const TEMP_LOCK_MINUTES = Number(process.env.TEMP_LOCK_MINUTES || 2)
const LOGIN_BONUS_AMOUNT = 10000
const unknownLoginAttempts = new Map()
const ipLoginAttempts = new Map()

function hashOtp(otpCode) {
  return crypto.createHash('sha256').update(String(otpCode)).digest('hex')
}

function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function getRemainingSeconds(lockUntil) {
  return Math.max(0, Math.ceil((lockUntil.getTime() - Date.now()) / 1000))
}

function getRequestIp(req) {
  return String((req.headers['x-forwarded-for'] || req.ip || 'unknown')).split(',')[0].trim()
}

function isKnownDevice(user, ip, deviceId) {
  return user.deviceFingerprints.some((fingerprint) => fingerprint.ip === ip && fingerprint.deviceId === deviceId)
}

function applyLoginBonusIfNeeded(user) {
  if (user.loginBonusGranted) {
    return false
  }

  user.walletBalance = Number(user.walletBalance || 0) + LOGIN_BONUS_AMOUNT
  user.totalIncome = Number(user.totalIncome || 0) + LOGIN_BONUS_AMOUNT
  user.totalExpenses = Number(user.totalExpenses || 0)
  user.loginBonusGranted = true
  return true
}

async function registerKnownDevice(user, req, deviceId) {
  if (!deviceId) {
    return
  }

  const ip = getRequestIp(req)

  if (isKnownDevice(user, ip, deviceId) || user.deviceFingerprints.length >= 5) {
    return
  }

  user.deviceFingerprints.push({
    ip,
    userAgent: String(req.headers['user-agent'] || ''),
    deviceId,
    addedAt: new Date(),
  })

  await user.save()
}

function getUnknownAttemptState(key) {
  const existing = unknownLoginAttempts.get(key)

  if (!existing) {
    return { attempts: 0, lockUntil: null }
  }

  if (existing.lockUntil && existing.lockUntil.getTime() <= Date.now()) {
    unknownLoginAttempts.delete(key)
    return { attempts: 0, lockUntil: null }
  }

  return existing
}

function recordUnknownAttempt(key) {
  const state = getUnknownAttemptState(key)
  const attempts = state.attempts + 1
  const remainingAttempts = Math.max(0, LOGIN_MAX_ATTEMPTS - attempts)

  if (remainingAttempts === 0) {
    const lockUntil = new Date(Date.now() + TEMP_LOCK_MINUTES * 60 * 1000)
    unknownLoginAttempts.set(key, { attempts: 0, lockUntil })
    return {
      locked: true,
      remainingAttempts: 0,
      lockRemainingSeconds: getRemainingSeconds(lockUntil),
    }
  }

  unknownLoginAttempts.set(key, { attempts, lockUntil: null })
  return {
    locked: false,
    remainingAttempts,
    lockRemainingSeconds: 0,
  }
}

function getIpState(key) {
  const existing = ipLoginAttempts.get(key)

  if (!existing) {
    return { attempts: 0, lockUntil: null }
  }

  if (existing.lockUntil && existing.lockUntil.getTime() <= Date.now()) {
    ipLoginAttempts.delete(key)
    return { attempts: 0, lockUntil: null }
  }

  return existing
}

function recordIpAttempt(key) {
  const state = getIpState(key)
  const attempts = state.attempts + 1
  const remainingAttempts = Math.max(0, LOGIN_MAX_ATTEMPTS - attempts)

  if (remainingAttempts === 0) {
    const lockUntil = new Date(Date.now() + TEMP_LOCK_MINUTES * 60 * 1000)
    ipLoginAttempts.set(key, { attempts: 0, lockUntil })
    return {
      locked: true,
      remainingAttempts: 0,
      lockRemainingSeconds: getRemainingSeconds(lockUntil),
    }
  }

  ipLoginAttempts.set(key, { attempts, lockUntil: null })
  return {
    locked: false,
    remainingAttempts,
    lockRemainingSeconds: 0,
  }
}

function sanitizeUser(user) {
  const normalizedFullName = String(user.fullName || '').trim()
  const nameParts = normalizedFullName.split(/\s+/).filter(Boolean)
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ')

  return {
    id: user._id,
    fullName: user.fullName,
    firstName,
    lastName,
    email: user.email,
    accountNumber: user.accountNumber,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    isOnboarded: user.isOnboarded || false,
    isDemoAccount: user.isDemoAccount || false,
    walletBalance: Number(user.walletBalance || 0),
    totalIncome: Number(user.totalIncome || 0),
    totalExpenses: Number(user.totalExpenses || 0),
    loginBonusGranted: Boolean(user.loginBonusGranted),
    hasLoginPin: Boolean(user.pinHash),
    personalInfo: {
      dateOfBirth: user.personalInfo?.dateOfBirth || '',
      gender: user.personalInfo?.gender || '',
      nationality: user.personalInfo?.nationality || '',
      countryOfResidence: user.personalInfo?.countryOfResidence || '',
    },
    contactInfo: {
      phoneNumber: user.contactInfo?.phoneNumber || '',
      physicalAddress: user.contactInfo?.physicalAddress || '',
      verified: Boolean(user.contactInfo?.verified),
    },
  }
}

router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Full name, email, and password are required' })
    }

    if (!EMAIL_PATTERN.test(String(email).toLowerCase())) {
      return res.status(400).json({ message: 'Please enter a valid email address' })
    }

    if (!PASSWORD_RULES.test(String(password))) {
      return res.status(400).json({ message: 'Password must be 8+ chars with uppercase, number, and symbol' })
    }

    const normalizedEmail = String(email).toLowerCase().trim()
    const existingUser = await User.findOne({ email: normalizedEmail })

    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists' })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const accountNumber = await createUniqueAccountNumber()

    const user = await User.create({
      fullName: String(fullName).trim(),
      email: normalizedEmail,
      passwordHash,
      accountNumber,
      isDemoAccount: true,
      walletBalance: 0,
      totalIncome: 0,
      totalExpenses: 0,
      loginBonusGranted: false,
    })

    return res.status(201).json({
      message: 'Registration successful. Please login to continue.',
      user: sanitizeUser(user),
    })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to create account' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const ipKey = String((req.headers['x-forwarded-for'] || req.ip || 'unknown')).split(',')[0].trim()
    const ipState = getIpState(ipKey)

    if (ipState.lockUntil && ipState.lockUntil.getTime() > Date.now()) {
      return res.status(429).json({
        message: 'Login is temporarily locked. Please wait before trying again.',
        remainingAttempts: 0,
        lockRemainingSeconds: getRemainingSeconds(ipState.lockUntil),
      })
    }

    const normalizedEmail = String(email).toLowerCase().trim()
    const unknownState = getUnknownAttemptState(normalizedEmail)

    if (unknownState.lockUntil && unknownState.lockUntil.getTime() > Date.now()) {
      return res.status(429).json({
        message: 'Login is temporarily locked. Please wait before trying again.',
        remainingAttempts: 0,
        lockRemainingSeconds: getRemainingSeconds(unknownState.lockUntil),
      })
    }

    const user = await User.findOne({ email: normalizedEmail })

    if (!user) {
      const result = recordUnknownAttempt(normalizedEmail)
      const ipResult = recordIpAttempt(ipKey)

      if (ipResult.locked) {
        return res.status(429).json({
          message: `Too many failed login attempts. Login is locked for ${TEMP_LOCK_MINUTES} minutes.`,
          remainingAttempts: 0,
          lockRemainingSeconds: ipResult.lockRemainingSeconds,
        })
      }

      if (result.locked) {
        return res.status(429).json({
          message: `Too many failed login attempts. Login is locked for ${TEMP_LOCK_MINUTES} minutes.`,
          remainingAttempts: 0,
          lockRemainingSeconds: result.lockRemainingSeconds,
        })
      }

      return res.status(401).json({
        message: 'Invalid email or password',
        remainingAttempts: Math.min(result.remainingAttempts, ipResult.remainingAttempts),
      })
    }

    unknownLoginAttempts.delete(normalizedEmail)

    if (user.loginPasswordLockUntil && user.loginPasswordLockUntil.getTime() > Date.now()) {
      return res.status(429).json({
        message: 'Login is temporarily locked. Please wait before trying again.',
        lockRemainingSeconds: getRemainingSeconds(user.loginPasswordLockUntil),
      })
    }

    if (user.loginPasswordLockUntil && user.loginPasswordLockUntil.getTime() <= Date.now()) {
      user.loginPasswordAttempts = 0
      user.loginPasswordLockUntil = null
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)

    if (!isMatch) {
      const ipResult = recordIpAttempt(ipKey)

      if (ipResult.locked) {
        return res.status(429).json({
          message: `Too many failed login attempts. Login is locked for ${TEMP_LOCK_MINUTES} minutes.`,
          remainingAttempts: 0,
          lockRemainingSeconds: ipResult.lockRemainingSeconds,
        })
      }

      user.loginPasswordAttempts += 1
      const remainingAttempts = Math.max(0, LOGIN_MAX_ATTEMPTS - user.loginPasswordAttempts)

      if (remainingAttempts === 0) {
        user.loginPasswordAttempts = 0
        user.loginPasswordLockUntil = new Date(Date.now() + TEMP_LOCK_MINUTES * 60 * 1000)
        await user.save()

        return res.status(429).json({
          message: `Too many failed password attempts. Login is locked for ${TEMP_LOCK_MINUTES} minutes.`,
          remainingAttempts: 0,
          lockRemainingSeconds: getRemainingSeconds(user.loginPasswordLockUntil),
        })
      }

      await user.save()
      return res.status(401).json({
        message: 'Invalid email or password',
        remainingAttempts: Math.min(remainingAttempts, ipResult.remainingAttempts),
      })
    }

    ipLoginAttempts.delete(ipKey)
    user.loginPasswordAttempts = 0
    user.loginPasswordLockUntil = null
    const otpCode = generateOtpCode()
    user.loginOtpHash = hashOtp(otpCode)
    user.loginOtpExpiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000)
    user.loginOtpAttempts = 0
    user.loginOtpLockUntil = null
    await user.save()

    try {
      await sendLoginOtpEmail({
        to: user.email,
        fullName: user.fullName,
        otpCode,
      })
    } catch (mailError) {
      return res.status(500).json({
        message: `Unable to send OTP email. ${mailError?.message || 'Check SMTP settings and try again.'}`,
      })
    }

    const otpToken = signToken(user._id.toString(), {
      expiresIn: `${OTP_EXPIRES_MINUTES}m`,
      purpose: 'login-otp',
    })

    return res.json({
      message: `OTP sent to ${user.email}. Enter it to complete login.`,
      otpToken,
    })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to login' })
  }
})

router.post('/verify-login-otp', async (req, res) => {
  try {
    const { otpToken, otp, deviceId } = req.body

    if (!otpToken || !otp) {
      return res.status(400).json({ message: 'OTP token and code are required' })
    }

    const payload = verifyToken(String(otpToken))

    if (payload.purpose !== 'login-otp') {
      return res.status(401).json({ message: 'Invalid OTP session. Please login again.' })
    }

    const user = await User.findById(payload.sub)

    if (!user || !user.loginOtpHash || !user.loginOtpExpiresAt) {
      return res.status(400).json({ message: 'No active OTP. Please login again.' })
    }

    if (user.loginOtpLockUntil && user.loginOtpLockUntil.getTime() > Date.now()) {
      return res.status(429).json({
        message: `OTP entry is temporarily locked. Try again in ${getRemainingSeconds(user.loginOtpLockUntil)}s.`,
        lockRemainingSeconds: getRemainingSeconds(user.loginOtpLockUntil),
      })
    }

    if (user.loginOtpLockUntil && user.loginOtpLockUntil.getTime() <= Date.now()) {
      user.loginOtpLockUntil = null
      user.loginOtpAttempts = 0
    }

    if (user.loginOtpAttempts >= OTP_MAX_ATTEMPTS) {
      user.loginOtpAttempts = 0
      user.loginOtpLockUntil = new Date(Date.now() + TEMP_LOCK_MINUTES * 60 * 1000)
      await user.save()

      return res.status(429).json({
        message: `Too many invalid OTP attempts. OTP is locked for ${TEMP_LOCK_MINUTES} minutes.`,
        remainingAttempts: 0,
        lockRemainingSeconds: getRemainingSeconds(user.loginOtpLockUntil),
      })
    }

    if (user.loginOtpExpiresAt.getTime() < Date.now()) {
      user.loginOtpHash = null
      user.loginOtpExpiresAt = null
      user.loginOtpAttempts = 0
      await user.save()

      return res.status(400).json({ message: 'OTP expired. Please login again.' })
    }

    const otpIsValid = hashOtp(String(otp)) === user.loginOtpHash

    if (!otpIsValid) {
      user.loginOtpAttempts += 1
      const remainingAttempts = Math.max(0, OTP_MAX_ATTEMPTS - user.loginOtpAttempts)

      if (remainingAttempts === 0) {
        user.loginOtpAttempts = 0
        user.loginOtpLockUntil = new Date(Date.now() + TEMP_LOCK_MINUTES * 60 * 1000)
        await user.save()

        return res.status(429).json({
          message: `Too many invalid OTP attempts. OTP is locked for ${TEMP_LOCK_MINUTES} minutes.`,
          remainingAttempts: 0,
          lockRemainingSeconds: getRemainingSeconds(user.loginOtpLockUntil),
        })
      }

      await user.save()
      return res.status(401).json({
        message: 'Invalid OTP code',
        remainingAttempts,
      })
    }

    user.loginOtpHash = null
    user.loginOtpExpiresAt = null
    user.loginOtpAttempts = 0
    user.loginOtpLockUntil = null

    if (deviceId) {
      await registerKnownDevice(user, req, String(deviceId))
    }

    const bonusJustAwarded = applyLoginBonusIfNeeded(user)
    await user.save()

    const authToken = signToken(user._id.toString())
    res.cookie('trusta_token', authToken, authCookieOptions())

    return res.json({
      user: {
        ...sanitizeUser(user),
        loginBonusJustReceived: bonusJustAwarded,
      },
    })
  } catch {
    return res.status(401).json({ message: 'Invalid OTP session. Please login again.' })
  }
})

router.post('/logout', (req, res) => {
  res.clearCookie('trusta_token', {
    ...authCookieOptions(),
    maxAge: 0,
  })

  return res.json({ message: 'Logged out successfully' })
})

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = req.user
    const bonusJustAwarded = applyLoginBonusIfNeeded(user)

    if (bonusJustAwarded) {
      await user.save()
    }

    return res.json({
      user: {
        ...sanitizeUser(user),
        loginBonusJustReceived: bonusJustAwarded,
      },
    })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to fetch user profile' })
  }
})

router.post('/pin-login-status', async (req, res) => {
  try {
    const { email, deviceId } = req.body

    if (!email || !deviceId) {
      return res.status(400).json({ message: 'Email and device ID are required' })
    }

    const normalizedEmail = String(email).toLowerCase().trim()
    const user = await User.findOne({ email: normalizedEmail })

    if (!user || !user.isOnboarded || !user.pinHash) {
      return res.json({ canUsePin: false })
    }

    const ip = getRequestIp(req)
    const canUsePin = isKnownDevice(user, ip, String(deviceId))

    if (!canUsePin) {
      return res.json({ canUsePin: false })
    }

    return res.json({
      canUsePin: true,
      name: user.fullName.split(' ')[0],
      maskedAccount: `${user.accountNumber.substring(0, 2)}${'*'.repeat(8)}`,
    })
  } catch {
    return res.status(500).json({ message: 'Unable to check PIN login status' })
  }
})

// Device Recognition
router.post('/recognize-device', requireAuth, async (req, res) => {
  try {
    const userAgent = String(req.headers['user-agent'] || '')
    const ip = getRequestIp(req)
    const deviceId = req.body.deviceId || 'unknown'

    const user = req.user
    const isRecognized = user.deviceFingerprints.some(
      (fp) => fp.ip === ip && fp.deviceId === deviceId,
    )

    if (!isRecognized && user.deviceFingerprints.length < 5) {
      user.deviceFingerprints.push({
        ip,
        userAgent,
        deviceId,
        addedAt: new Date(),
      })
      await user.save()
    }

    return res.json({
      isRecognized,
      maskedAccount: `${user.accountNumber.substring(0, 2)}${'*'.repeat(8)}`,
      name: user.fullName.split(' ')[0],
    })
  } catch (error) {
    return res.status(500).json({ message: 'Device recognition failed' })
  }
})

// PIN Login
router.post('/verify-pin', async (req, res) => {
  try {
    const { email, pin, deviceId } = req.body

    if (!email || !pin || !deviceId) {
      return res.status(400).json({ message: 'Email, device ID, and PIN are required' })
    }

    const normalizedEmail = String(email).toLowerCase().trim()
    const user = await User.findOne({ email: normalizedEmail })

    if (!user || !user.isOnboarded || !user.pinHash) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const ip = getRequestIp(req)
    const recognizedDevice = isKnownDevice(user, ip, String(deviceId))

    if (!recognizedDevice) {
      return res.status(403).json({
        message: 'This device is not recognized. Use email and OTP login.',
      })
    }

    // Check PIN lockout
    if (user.pinLockedUntil && user.pinLockedUntil.getTime() > Date.now()) {
      return res.status(429).json({
        message: 'PIN entry is temporarily locked. Try again later.',
        lockRemainingSeconds: getRemainingSeconds(user.pinLockedUntil),
      })
    }

    if (user.pinLockedUntil && user.pinLockedUntil.getTime() <= Date.now()) {
      user.failedPinAttempts = 0
      user.pinLockedUntil = null
    }

    // Validate PIN with Argon2
    const isValidPin = await argon2.verify(user.pinHash, String(pin))

    if (!isValidPin) {
      user.failedPinAttempts += 1
      const remainingAttempts = Math.max(0, 3 - user.failedPinAttempts)

      if (remainingAttempts === 0) {
        user.pinLockedUntil = new Date(Date.now() + 15 * 60 * 1000) // 15 min lockout
        user.failedPinAttempts = 0
        await user.save()

        return res.status(429).json({
          message: 'Too many failed PIN attempts. Locked for 15 minutes.',
          remainingAttempts: 0,
          lockRemainingSeconds: getRemainingSeconds(user.pinLockedUntil),
        })
      }

      await user.save()
      return res.status(401).json({
        message: 'Invalid PIN',
        remainingAttempts,
      })
    }

    // Reset attempts on success
    user.failedPinAttempts = 0
    user.pinLockedUntil = null
    user.lastLoginIp = ip
    user.lastLoginAt = new Date()
    const bonusJustAwarded = applyLoginBonusIfNeeded(user)
    await user.save()

    const authToken = signToken(user._id.toString())
    res.cookie('trusta_token', authToken, authCookieOptions())

    return res.json({
      user: {
        ...sanitizeUser(user),
        loginBonusJustReceived: bonusJustAwarded,
      },
    })
  } catch (error) {
    return res.status(500).json({ message: 'PIN verification failed' })
  }
})

// Setup PINs during onboarding
router.post('/setup-pins', requireAuth, async (req, res) => {
  try {
    const { pin, transactionPin } = req.body

    if (!pin || !transactionPin) {
      return res.status(400).json({ message: 'Both PIN and transaction PIN are required' })
    }

    // Validate PIN format (6 digits, numbers only)
    if (!/^\d{6}$/.test(String(pin))) {
      return res.status(400).json({ message: 'PIN must be exactly 6 digits' })
    }

    if (!/^\d{4}$/.test(String(transactionPin))) {
      return res.status(400).json({ message: 'Transaction PIN must be exactly 4 digits' })
    }

    if (pin === transactionPin) {
      return res.status(400).json({ message: 'PIN and transaction PIN must be different' })
    }

    const user = req.user
    user.pinHash = await argon2.hash(String(pin))
    user.transactionPinHash = await argon2.hash(String(transactionPin))
    await user.save()

    return res.json({ message: 'PINs set successfully' })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to setup PINs' })
  }
})

// Complete Onboarding
router.post('/complete-onboarding', requireAuth, async (req, res) => {
  try {
    const { personalInfo, contactInfo } = req.body

    if (!personalInfo || !contactInfo) {
      return res.status(400).json({ message: 'Personal and contact info are required' })
    }

    const user = req.user
    user.personalInfo = {
      dateOfBirth: personalInfo.dateOfBirth,
      gender: personalInfo.gender,
      nationality: personalInfo.nationality,
      countryOfResidence: personalInfo.countryOfResidence,
    }
    user.contactInfo = {
      phoneNumber: contactInfo.phoneNumber,
      physicalAddress: contactInfo.physicalAddress,
      verified: false,
    }
    user.isOnboarded = true
    await user.save()

    return res.json({ message: 'Onboarding completed', user: sanitizeUser(user) })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to complete onboarding' })
  }
})

// Check onboarding status
router.get('/onboarding-status', requireAuth, (req, res) => {
  return res.json({
    isOnboarded: req.user.isOnboarded,
    hasPins: Boolean(req.user.pinHash && req.user.transactionPinHash),
  })
})

router.post('/complete-registration', requireAuth, async (req, res) => {
  try {
    const firstName = String(req.body?.firstName || '').trim()
    const lastName = String(req.body?.lastName || '').trim()

    if (!firstName || !lastName) {
      return res.status(400).json({ message: 'First name and last name are required' })
    }

    if (!/^[A-Za-z'-\s]{2,60}$/.test(firstName) || !/^[A-Za-z'-\s]{2,60}$/.test(lastName)) {
      return res.status(400).json({ message: 'Names can only contain letters, spaces, apostrophes, or hyphens' })
    }

    const user = req.user
    user.fullName = `${firstName} ${lastName}`.replace(/\s+/g, ' ').trim()
    await user.save()

    return res.json({ message: 'Registration details updated', user: sanitizeUser(user) })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to complete registration' })
  }
})

export default router
