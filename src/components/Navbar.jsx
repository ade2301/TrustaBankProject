import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Button from './Button'
import trustaLogo from '../assets/trusta-logo-final.png'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { isAuthenticated, logout } = useAuth()
  const navRef = useRef(null)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [clickedPath, setClickedPath] = useState('')

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/features', label: 'Features' },
    { to: '/solutions', label: 'Solutions' },
    { to: '/about', label: 'About' },
    { to: '/careers', label: 'Careers' },
    { to: '/blog', label: 'Blog' },
    { to: '/contact', label: 'Contact' },
    ...(!isAuthenticated
      ? [
          { to: '/login', label: 'Login', mobileOnly: true },
          { to: '/register', label: 'Sign Up', mobileOnly: true },
        ]
      : []),
  ]

  const closeMobileMenu = () => setMobileOpen(false)

  const handleNavLinkClick = (path) => {
    setClickedPath(path)
    closeMobileMenu()
  }

  const handleLogout = async () => {
    closeMobileMenu()
    await logout()
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll)

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!clickedPath) {
      return undefined
    }

    const timerId = window.setTimeout(() => setClickedPath(''), 420)
    return () => window.clearTimeout(timerId)
  }, [clickedPath])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeMobileMenu()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!mobileOpen || !navRef.current) {
        return
      }

      if (!navRef.current.contains(event.target)) {
        closeMobileMenu()
      }
    }

    window.addEventListener('pointerdown', onPointerDown)

    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [mobileOpen])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1100) {
        closeMobileMenu()
      }
    }

    window.addEventListener('resize', onResize)

    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <header className={`navbar-wrap ${scrolled ? 'navbar-scrolled' : ''}`}>
      <nav className="navbar" ref={navRef}>
        <Link to="/" className="brand" aria-label="Trusta Bank home">
          <img src={trustaLogo} alt="Trusta Bank" className="brand-logo" />
        </Link>

        <div className={`nav-links ${mobileOpen ? 'mobile-open' : ''}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => handleNavLinkClick(item.to)}
              className={({ isActive }) =>
                `nav-link${item.mobileOnly ? ' mobile-auth' : ''}${isActive ? ' active' : ''}${clickedPath === item.to ? ' is-clicked' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}

          {isAuthenticated && (
            <button type="button" className="nav-link mobile-auth" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>

        <div className="nav-actions">
          {!isAuthenticated ? (
            <>
              <Button variant="ghost" to="/login">
                Login
              </Button>
              <Button variant="gradient" to="/register">
                Sign Up
              </Button>
            </>
          ) : (
            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </div>

        <button
          className={`mobile-toggle ${mobileOpen ? 'active' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={mobileOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      <button
        type="button"
        className={`mobile-backdrop ${mobileOpen ? 'is-open' : ''}`}
        onClick={closeMobileMenu}
        aria-label="Close mobile menu"
      />
    </header>
  )
}

export default Navbar
