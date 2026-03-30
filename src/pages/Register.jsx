import { Link } from 'react-router-dom'
import Button from '../components/Button'
import Input from '../components/Input'

function Register() {
  return (
    <div className="auth-page page-load">
      <div className="auth-overlay" />
      <section className="auth-card card-glass">
        <p className="eyebrow">Create Account</p>
        <h1>Join Trusta Bank</h1>

        <form className="auth-form">
          <Input
            id="fullName"
            label="Full Name"
            type="text"
            placeholder="John Doe"
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
            required
          />

          <Button type="submit" fullWidth>
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
