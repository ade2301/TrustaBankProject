import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { Router } from 'express'
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
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    accountNumber: user.accountNumber,
    createdAt: user.createdAt,
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
    } catch {
      user.loginOtpHash = null
      user.loginOtpExpiresAt = null
      user.loginOtpAttempts = 0
      await user.save()

      return res.status(500).json({
        message: 'OTP email is not configured yet. Add SMTP settings in server/.env and try again.',
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
    const { otpToken, otp } = req.body

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
    await user.save()

    const authToken = signToken(user._id.toString())
    res.cookie('trusta_token', authToken, authCookieOptions())

    return res.json({ user: sanitizeUser(user) })
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

router.get('/me', requireAuth, (req, res) => {
  return res.json({ user: sanitizeUser(req.user) })
})

export default router
