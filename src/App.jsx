import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ThemeToggle from './components/ThemeToggle'
import Home from './pages/Home'
import About from './pages/About'
import Login from './pages/Login'
import Register from './pages/Register'
import Solutions from './pages/Solutions'
import Features from './pages/Features'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Contact from './pages/Contact'
import Careers from './pages/Careers'
import PrivacyPolicy from './pages/PrivacyPolicy'
import CookiePolicy from './pages/CookiePolicy'
import { useAuth } from './context/AuthContext'

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  const location = useLocation()
  const { isLoading } = useAuth()
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register'
  const [theme, setTheme] = useState(() => {
    const storedTheme = window.localStorage.getItem('trusta-theme')
    return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.body.setAttribute('data-theme', theme)
    window.localStorage.setItem('trusta-theme', theme)
  }, [theme])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  if (isLoading) {
    return null
  }

  return (
    <div className="app-shell">
      <ThemeToggle theme={theme} onToggle={toggleTheme} />

      {!isAuthRoute && <Navbar />}

      <main className={`page-shell ${isAuthRoute ? 'auth-layout' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/pricing" element={<Navigate to="/solutions" replace />} />
          <Route path="/features" element={<Features />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            }
          />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      {!isAuthRoute && <Footer />}
    </div>
  )
}

export default App
