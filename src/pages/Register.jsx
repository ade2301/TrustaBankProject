import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import Input from '../components/Input'
import trustaLogo from '../assets/trusta-logo-final.png'
import { useAuth } from '../context/AuthContext'

const getPasswordChecks = (password) => {
  return {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  }
}

function Register() {
  const { register } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const passwordChecks = useMemo(() => getPasswordChecks(password), [password])
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword
  const passedChecksCount = Object.values(passwordChecks).filter(Boolean).length
  const strengthPercent = (passedChecksCount / 4) * 100
  const isPasswordStrong = passedChecksCount === 4
  const canSubmit = isPasswordStrong && passwordsMatch

  const passwordRules = [
    { label: 'At least 8 characters', met: passwordChecks.minLength },
    { label: 'At least 1 uppercase letter', met: passwordChecks.uppercase },
    { label: 'At least 1 number', met: passwordChecks.number },
    { label: 'At least 1 symbol', met: passwordChecks.symbol },
    { label: 'Confirm password matches', met: passwordsMatch },
  ]

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!canSubmit) {
      return
    }

    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      const response = await register({ fullName, email, password })
      setSuccess(response.message || 'Registration successful. Please login to continue.')
      setFullName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
    } catch (requestError) {
      setError(requestError.message || 'Unable to create account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-page page-load">
      {success && (
        <div className="auth-top-flash auth-top-flash-success" role="status" aria-live="polite">
          <p>{success}</p>
          <button
            type="button"
            className="auth-top-flash-close"
            onClick={() => setSuccess('')}
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
          <p className="eyebrow">Create Account</p>
          <h1>Join Trusta Bank</h1>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <Input
            id="fullName"
            label="Full Name"
            type="text"
            filter="text"
            placeholder="Oloriire Daniel Chukwuka"
            name="fullName"
            autoComplete="name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            disabled={isSubmitting}
            required
          />

          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isSubmitting}
            required
          />

          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="Create a password"
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isSubmitting}
            enablePasswordToggle
            required
          />

          <div className={`confirm-password-state${passwordsMatch ? ' is-valid' : ''}`}>
            <Input
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              name="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={isSubmitting}
              enablePasswordToggle
              required
            />
          </div>

          <div className="password-strength-wrap" aria-live="polite">
            <div className="password-strength-track">
              <span className="password-strength-fill" style={{ width: `${strengthPercent}%` }} />
            </div>
            <p className="password-strength-label">
              Password strength: {isPasswordStrong ? 'Strong' : passedChecksCount > 0 ? 'Getting there' : 'Start typing'}
            </p>
            <p className="auth-notice">
              Use a password that satisfies every item below. Checked items are already met; unchecked ones still need to be added.
            </p>
            <ul className="password-rules">
              {passwordRules.map((rule) => (
                <li key={rule.label} className={rule.met ? 'is-valid' : 'is-pending'}>
                  {rule.label}
                </li>
              ))}
            </ul>
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="auth-notice">Confirm password must be exactly the same as password.</p>
            )}
            {passwordsMatch && <p className="auth-notice auth-notice-success">Confirm password matched.</p>}
          </div>

          <Button type="submit" fullWidth disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </Button>

          {error && <p className="auth-notice auth-notice-danger">{error}</p>}
        </form>

        <p className="auth-footnote">
          Already have an account? <Link to="/login">Login</Link>
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

export default Register
