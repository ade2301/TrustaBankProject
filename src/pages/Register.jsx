import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import Input from '../components/Input'
import trustaLogo from '../assets/trusta-logo-final.png'

const getPasswordChecks = (password) => {
  return {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  }
}

function Register() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const passwordChecks = useMemo(() => getPasswordChecks(password), [password])
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword
  const passedChecksCount = Object.values(passwordChecks).filter(Boolean).length
  const strengthPercent = (passedChecksCount / 4) * 100
  const isPasswordStrong = passedChecksCount === 4
  const canSubmit = isPasswordStrong && passwordsMatch

  const fulfilledRules = [
    passwordChecks.minLength && 'At least 8 characters',
    passwordChecks.uppercase && 'At least 1 uppercase letter',
    passwordChecks.number && 'At least 1 number',
    passwordChecks.symbol && 'At least 1 symbol',
    passwordsMatch && 'Confirm password matches',
  ].filter(Boolean)

  return (
    <div className="auth-page page-load">
      <div className="auth-overlay" />
      <section className="auth-card card-glass">
        <div className="auth-brand-top">
          <img src={trustaLogo} alt="Trusta Bank" className="auth-logo" />
          <p className="eyebrow">Create Account</p>
          <h1>Join Trusta Bank</h1>
        </div>

        <form className="auth-form">
          <Input
            id="fullName"
            label="Full Name"
            type="text"
            placeholder="Oloriire Daniel Chukwuka"
            name="fullName"
            autoComplete="name"
            required
          />

          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            name="email"
            autoComplete="email"
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
              enablePasswordToggle
              required
            />
          </div>

          <div className="password-strength-wrap" aria-live="polite">
            <div className="password-strength-track">
              <span className="password-strength-fill" style={{ width: `${strengthPercent}%` }} />
            </div>
            <p className="password-strength-label">
              Password strength: {isPasswordStrong ? 'Strong' : 'Needs improvement'}
            </p>
            <ul className="password-rules">
              {fulfilledRules.map((rule) => (
                <li key={rule} className="is-valid">
                  {rule}
                </li>
              ))}
            </ul>
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="auth-notice">Confirm password must be exactly the same as password.</p>
            )}
            {passwordsMatch && <p className="auth-notice auth-notice-success">Confirm password matched.</p>}
          </div>

          <Button type="submit" fullWidth disabled={!canSubmit}>
            Create Account
          </Button>
        </form>

        <p className="auth-footnote">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </div>
  )
}

export default Register
