import { Link } from 'react-router-dom'
import Button from '../components/Button'
import Input from '../components/Input'

function Login() {
  return (
    <div className="auth-page page-load">
      <div className="auth-overlay" />
      <section className="auth-card card-glass">
        <p className="eyebrow">Welcome Back</p>
        <h1>Login to Trusta</h1>

        <form className="auth-form">
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
            placeholder="Enter your password"
            name="password"
            autoComplete="current-password"
            required
          />

          <div className="auth-meta">
            <Link to="#" className="text-link">
              Forgot Password?
            </Link>
          </div>

          <Button type="submit" fullWidth>
            Login
          </Button>
        </form>

        <p className="auth-footnote">
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
      </section>
    </div>
  )
}

export default Login
