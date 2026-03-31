import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Input from '../components/Input'
import trustaLogo from '../assets/trusta-logo-final.png'
import { useAuth } from '../context/AuthContext'

function Login() {
  const navigate = useNavigate()
  const { login, verifyOtp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [otpToken, setOtpToken] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [lockSeconds, setLockSeconds] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const lockCountdownText = useMemo(() => {
    if (lockSeconds <= 0) {
      return ''
    }

    const mins = Math.floor(lockSeconds / 60)
    const secs = lockSeconds % 60
    return `${mins}:${String(secs).padStart(2, '0')}`
  }, [lockSeconds])

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
        await verifyOtp({ otpToken, otp })
        navigate('/')
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
          <h1>Login to Trusta</h1>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
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
      </section>
    </div>
  )
}

export default Login
