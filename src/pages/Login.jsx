import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Input from '../components/Input'
import trustaLogo from '../assets/trusta-logo-final.png'
import AppSplash from '../components/AppSplash'
import { useAuth } from '../context/AuthContext'
import { checkPinLoginStatus } from '../lib/authApi'
import { getDeviceId } from '../lib/device'

function Login() {
  const navigate = useNavigate()
  const { login, verifyOtp, verifyPin } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [loginPin, setLoginPin] = useState('')
  const [otpToken, setOtpToken] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [lockSeconds, setLockSeconds] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rememberedProfile, setRememberedProfile] = useState(null)
  const [isCheckingPinProfile, setIsCheckingPinProfile] = useState(true)
  const [showPinSplash, setShowPinSplash] = useState(false)

  const deviceId = useMemo(() => getDeviceId(), [])

  useEffect(() => {
    let splashTimer
    const rawProfile = window.localStorage.getItem('trusta_pin_profile')

    if (!rawProfile) {
      setIsCheckingPinProfile(false)
      return
    }

    try {
      const parsed = JSON.parse(rawProfile)
      if (parsed?.email && parsed?.firstName && parsed?.maskedAccount) {
        const validatePinLoginStatus = async () => {
          try {
            const status = await checkPinLoginStatus(parsed.email, deviceId)

            if (status?.canUsePin) {
              setShowPinSplash(true)
              setRememberedProfile({
                email: parsed.email,
                firstName: status.name || parsed.firstName,
                maskedAccount: status.maskedAccount || parsed.maskedAccount,
              })
              setEmail(parsed.email)
              splashTimer = window.setTimeout(() => {
                setShowPinSplash(false)
              }, 1100)
              return
            }
          } catch {
            // Fall through to credential login mode on status-check errors.
          }

          window.localStorage.removeItem('trusta_pin_profile')
          setRememberedProfile(null)
          setShowPinSplash(false)
        }

        void validatePinLoginStatus().finally(() => {
          setIsCheckingPinProfile(false)
        })
      } else {
        setIsCheckingPinProfile(false)
      }
    } catch {
      window.localStorage.removeItem('trusta_pin_profile')
      setShowPinSplash(false)
      setIsCheckingPinProfile(false)
    }

    return () => {
      if (splashTimer) {
        window.clearTimeout(splashTimer)
      }
    }
  }, [deviceId])

  const isPinLoginMode = Boolean(rememberedProfile) && !otpToken

  const lockCountdownText = useMemo(() => {
    if (lockSeconds <= 0) {
      return ''
    }

    const mins = Math.floor(lockSeconds / 60)
    const secs = lockSeconds % 60
    return `${mins}:${String(secs).padStart(2, '0')}`
  }, [lockSeconds])

  const submitPinLogin = async () => {
    if (!isPinLoginMode || lockSeconds > 0 || isSubmitting) {
      return
    }

    if (!/^\d{6}$/.test(loginPin)) {
      setErrorMessage('Enter your 6-digit login PIN to continue.')
      return
    }

    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      const authenticatedUser = await verifyPin({ email: rememberedProfile.email, pin: loginPin })
      navigate(authenticatedUser?.isOnboarded ? '/dashboard' : '/onboarding')
    } catch (requestError) {
      const remainingAttempts =
        typeof requestError.remainingAttempts === 'number' ? requestError.remainingAttempts : null
      const remainingLockSeconds =
        typeof requestError.lockRemainingSeconds === 'number' ? requestError.lockRemainingSeconds : 0

      if (remainingLockSeconds > 0) {
        setLockSeconds(remainingLockSeconds)
      }

      let message = requestError.message || 'Unable to verify PIN. Please try again.'

      if (remainingAttempts !== null && remainingAttempts >= 0) {
        message = `${message} ${remainingAttempts} attempts remaining before temporary lock.`
      }

      setErrorMessage(message)
      setLoginPin('')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!isPinLoginMode || lockSeconds > 0 || loginPin.length !== 6) {
      return
    }

    void submitPinLogin()
  }, [isPinLoginMode, lockSeconds, loginPin])

  const appendPinDigit = (digit) => {
    if (isSubmitting || lockSeconds > 0) {
      return
    }

    setErrorMessage('')
    setLoginPin((currentPin) => (currentPin.length < 6 ? `${currentPin}${digit}` : currentPin))
  }

  const removePinDigit = () => {
    if (isSubmitting || lockSeconds > 0) {
      return
    }

    setErrorMessage('')
    setLoginPin((currentPin) => currentPin.slice(0, -1))
  }

  useEffect(() => {
    if (lockSeconds <= 0) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setLockSeconds((current) => (current > 0 ? current - 1 : 0))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [lockSeconds])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (lockSeconds > 0) {
      return
    }

    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      if (!otpToken) {
        const response = await login({ email, password })
        setOtpToken(response.otpToken)
        setSuccessMessage('OTP sent. Check your email and enter the 6-digit code.')
      } else {
        const authenticatedUser = await verifyOtp({ otpToken, otp, deviceId })
        navigate(authenticatedUser?.isOnboarded ? '/dashboard' : '/onboarding')
      }
    } catch (requestError) {
      const remainingAttempts =
        typeof requestError.remainingAttempts === 'number' ? requestError.remainingAttempts : null
      const remainingLockSeconds =
        typeof requestError.lockRemainingSeconds === 'number' ? requestError.lockRemainingSeconds : 0

      if (remainingLockSeconds > 0) {
        setLockSeconds(remainingLockSeconds)
      }

      let message = requestError.message || 'Unable to login. Please try again.'

      if (remainingAttempts !== null && remainingAttempts >= 0) {
        message = `${message} ${remainingAttempts} attempts remaining before temporary lock.`
      }

      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const useAnotherAccount = () => {
    setRememberedProfile(null)
    setShowPinSplash(false)
    setIsCheckingPinProfile(false)
    setLoginPin('')
    setOtpToken('')
    setPassword('')
    setOtp('')
    setEmail('')
    setErrorMessage('')
    setSuccessMessage('')
    window.localStorage.removeItem('trusta_pin_profile')
  }

  if (showPinSplash || (isCheckingPinProfile && !otpToken)) {
    return <AppSplash message="Opening your secure PIN login..." />
  }

  if (isPinLoginMode) {
    return (
      <div className="pin-login-page page-load">
        <div className="pin-login-glow" />

        <section className="pin-login-phone card-glass" aria-label="PIN unlock screen">
          <div className="pin-login-notch" />

          <img src={trustaLogo} alt="Trusta Bank" className="pin-login-logo" />

          <div className="pin-login-avatar" aria-hidden="true">
            <span>{rememberedProfile.firstName.charAt(0)}</span>
          </div>

          <h1 className="pin-login-title">Welcome {rememberedProfile.firstName}</h1>
          <p className="pin-login-subtitle">Account: {rememberedProfile.maskedAccount}</p>
          <p className="pin-login-prompt">Enter your 6-digit PIN</p>

          <div className="pin-login-dots" role="group" aria-label="PIN status">
            {Array.from({ length: 6 }).map((_, index) => (
              <span key={index} className={`pin-login-dot ${index < loginPin.length ? 'filled' : ''}`} />
            ))}
          </div>

          <div className="pin-login-keypad" role="group" aria-label="PIN keypad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <button
                key={digit}
                type="button"
                className="pin-key"
                onClick={() => appendPinDigit(String(digit))}
                disabled={isSubmitting || lockSeconds > 0}
              >
                {digit}
              </button>
            ))}

            <span className="pin-key pin-key-empty" aria-hidden="true" />

            <button
              type="button"
              className="pin-key"
              onClick={() => appendPinDigit('0')}
              disabled={isSubmitting || lockSeconds > 0}
            >
              0
            </button>

            <button
              type="button"
              className="pin-key pin-key-back"
              onClick={removePinDigit}
              disabled={isSubmitting || lockSeconds > 0 || loginPin.length === 0}
              aria-label="Delete last digit"
            >
              x
            </button>
          </div>

          {lockSeconds > 0 && (
            <p className="pin-login-status pin-login-status-danger">Temporary lock: {lockCountdownText}</p>
          )}

          {isSubmitting && <p className="pin-login-status">Verifying PIN...</p>}

          {errorMessage && <p className="pin-login-status pin-login-status-danger">{errorMessage}</p>}

          <button
            type="button"
            className="text-link auth-switch-account pin-switch-account"
            onClick={useAnotherAccount}
            disabled={isSubmitting}
          >
            Use another account
          </button>

          <Link to="/" className="auth-back-link pin-back-link">
            Back to landing page
          </Link>
        </section>
      </div>
    )
  }

  return (
    <div className="auth-page page-load">
      {successMessage && (
        <div className="auth-top-flash auth-top-flash-success" role="status" aria-live="polite">
          <p>{successMessage}</p>
          <button
            type="button"
            className="auth-top-flash-close"
            onClick={() => setSuccessMessage('')}
            aria-label="Dismiss success message"
          >
            x
          </button>
        </div>
      )}

      <div className="auth-overlay" />
      <section className="auth-card card-glass">
        <div className="auth-brand-top">
          <img src={trustaLogo} alt="Trusta Bank" className="auth-logo" />
          <p className="eyebrow">Welcome Back</p>
          <h1>{isPinLoginMode ? `Welcome back, ${rememberedProfile.firstName}` : 'Login to Trusta'}</h1>
          {isPinLoginMode && <p className="auth-notice">Account: {rememberedProfile.maskedAccount}</p>}
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isPinLoginMode ? (
            <>
              <div className="form-group">
                <label>Enter 6-digit login PIN</label>
                <PinInput
                  length={6}
                  onChange={setLoginPin}
                />
              </div>

              <button
                type="button"
                className="text-link auth-switch-account"
                onClick={useAnotherAccount}
                disabled={isSubmitting}
              >
                Use another account
              </button>
            </>
          ) : (
            <>
              <Input
                id="email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isSubmitting || lockSeconds > 0}
                required
              />

              <Input
                id="password"
                label="Password"
                type="password"
                placeholder="Enter your password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isSubmitting || lockSeconds > 0}
                enablePasswordToggle
                required
              />
            </>
          )}

          {otpToken && (
            <Input
              id="otp"
              label="OTP Code"
              type="text"
              placeholder="Enter 6-digit code"
              name="otp"
              autoComplete="one-time-code"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={isSubmitting || lockSeconds > 0}
              required
            />
          )}

          <div className="auth-meta">
            <Link to="#" className="text-link">
              Forgot Password?
            </Link>
          </div>

          <Button type="submit" fullWidth disabled={isSubmitting || lockSeconds > 0}>
            {isSubmitting
              ? 'Please wait...'
              : lockSeconds > 0
                ? `Locked ${lockCountdownText}`
                : otpToken
                  ? 'Verify OTP'
                  : isPinLoginMode
                    ? 'Login with PIN'
                    : 'Login'}
          </Button>

          {lockSeconds > 0 && (
            <p className="auth-notice auth-notice-danger">
              Temporary lock active. Try again in {lockCountdownText}.
            </p>
          )}

          {errorMessage && (
            <div className="auth-inline-alert auth-inline-alert-danger" role="status" aria-live="polite">
              <p>{errorMessage}</p>
              <button
                type="button"
                className="auth-inline-alert-close"
                onClick={() => setErrorMessage('')}
                aria-label="Dismiss error message"
              >
                x
              </button>
            </div>
          )}

          <p className="auth-notice auth-notice-danger">
            Security: 5 wrong password or OTP attempts trigger a 2-minute temporary lock.
          </p>
        </form>

        <p className="auth-footnote">
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>

        <p className="auth-footnote auth-back-footnote">
          <Link to="/" className="auth-back-link">
            Back to landing page
          </Link>
        </p>
      </section>
    </div>
  )
}

export default Login
