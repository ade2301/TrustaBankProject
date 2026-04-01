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
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Analysis from './pages/Analysis'
import AppSplash from './components/AppSplash'

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading, isSessionUnlocked, user } = useAuth()

  if (isLoading) {
    return null
  }

  if (isAuthenticated && isSessionUnlocked) {
    return <Navigate to={user?.isOnboarded ? '/dashboard' : '/onboarding'} replace />
  }

  return children
}

function HomeRoute() {
  const { isAuthenticated, isLoading, isSessionUnlocked, user } = useAuth()

  if (isLoading) {
    return null
  }

  if (isAuthenticated) {
    if (!isSessionUnlocked) {
      return <Navigate to="/login" replace />
    }

    return <Navigate to={user?.isOnboarded ? '/dashboard' : '/onboarding'} replace />
  }

  return <Home />
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, isSessionUnlocked, user } = useAuth()

  if (isLoading) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isSessionUnlocked) {
    return <Navigate to="/login" replace />
  }

  if (!user?.isOnboarded) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}

function OnboardingRoute({ children }) {
  const { isAuthenticated, isLoading, isSessionUnlocked, user } = useAuth()

  if (isLoading) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isSessionUnlocked) {
    return <Navigate to="/login" replace />
  }

  if (user?.isOnboarded) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function App() {
  const location = useLocation()
  const { isLoading, isAuthenticated, isSessionUnlocked, user } = useAuth()
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register'
  const isDashboardRoute = location.pathname === '/dashboard'
  const isOnboardingRoute = location.pathname === '/onboarding'
  const [showDashboardSplash, setShowDashboardSplash] = useState(false)
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

  useEffect(() => {
    if (isLoading) {
      return undefined
    }

    const shouldShowDashboardSplash =
      location.pathname === '/dashboard' &&
      isAuthenticated &&
      isSessionUnlocked &&
      Boolean(user?.isOnboarded)

    if (!shouldShowDashboardSplash) {
      setShowDashboardSplash(false)
      return undefined
    }

    setShowDashboardSplash(true)
    const timer = window.setTimeout(() => {
      setShowDashboardSplash(false)
    }, 1300)

    return () => {
      window.clearTimeout(timer)
    }
  }, [location.pathname, isAuthenticated, isSessionUnlocked, user, isLoading])

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  if (isLoading) {
    return <AppSplash message="Loading your secure session..." />
  }

  if (showDashboardSplash) {
    return <AppSplash message="Preparing your dashboard..." />
  }

  return (
    <div className="app-shell">
      {!isDashboardRoute && <ThemeToggle theme={theme} onToggle={toggleTheme} />}

      {!isAuthRoute && !isDashboardRoute && !isOnboardingRoute && <Navbar />}

      <main className={`page-shell ${isAuthRoute ? 'auth-layout' : ''} ${isDashboardRoute ? 'dashboard-layout' : ''} ${location.pathname === '/' ? 'home-shell' : ''}`}>
        <Routes>
          <Route path="/" element={<HomeRoute />} />
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
            <Route
              path="/onboarding"
              element={
                <OnboardingRoute>
                  <Onboarding />
                </OnboardingRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                    <Dashboard theme={theme} onToggleTheme={toggleTheme} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analysis"
              element={
                <ProtectedRoute>
                  <Analysis />
                </ProtectedRoute>
              }
            />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      {!isAuthRoute && !isDashboardRoute && !isOnboardingRoute && <Footer />}
    </div>
  )
}

export default App
