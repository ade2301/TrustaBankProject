import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import RevealSection from '../components/RevealSection'

const features = [
  {
    title: 'Instant Transfers',
    description: 'Move money in seconds with fast local and global settlement powered by reliable rails.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 7h10m0 0L11 4m3 3-3 3M20 17H10m0 0 3 3m-3-3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Advanced Security',
    description: 'Biometric protection, real-time threat detection, and transaction-level encryption by default.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3 5 6v5c0 5 3.2 8.8 7 10 3.8-1.2 7-5 7-10V6l-7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m9.3 12 1.8 1.8 3.6-3.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Real-Time Tracking',
    description: 'Monitor your balances, spending categories, and transfers with live updates and insights.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 18h16M6 15l3-3 3 2 5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Global Access',
    description: 'Send, receive, and manage funds from anywhere with multi-currency wallet support.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3a9 9 0 1 0 0 18m0-18c2.3 2.4 3.5 5.5 3.5 9S14.3 18.6 12 21m0-18c-2.3 2.4-3.5 5.5-3.5 9S9.7 18.6 12 21m-8-9h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Smart Bill Payments',
    description: 'Pay electricity, TV, internet, and more with reminders and automatic recurring schedules.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 3h10v18l-5-3-5 3V3Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Savings Goals',
    description: 'Create goal-based pockets and automate deposits to hit your monthly and yearly targets.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 8v4l2.5 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

const steps = [
  {
    title: 'Create Account',
    text: 'Sign up in minutes with secure identity checks.',
  },
  {
    title: 'Fund Your Wallet',
    text: 'Top up your account via transfer or card instantly.',
  },
  {
    title: 'Send & Manage Money',
    text: 'Pay, transfer, and track every movement in real time.',
  },
]

function Home() {
  const [storeModal, setStoreModal] = useState({ open: false, store: '' })

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setStoreModal({ open: false, store: '' })
      }
    }

    if (storeModal.open) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', onKeyDown)
    }

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [storeModal.open])

  const openStoreModal = (store) => {
    setStoreModal({ open: true, store })
  }

  const closeStoreModal = () => {
    setStoreModal({ open: false, store: '' })
  }

  return (
    <div className="page page-load home-page">
      <RevealSection className="hero-section home-hero-mobile" delay={0.1}>
        <div className="hero-copy">
          <p className="eyebrow hero-seq hero-1">Trusta Bank</p>
          <h1 className="hero-seq hero-2">Send, Save, and Pay Bills Faster With Trusta</h1>
          <p className="hero-subtext hero-seq hero-3">
            A modern Nigerian digital bank for everyday payments, business collections, and secure wallet growth.
          </p>
          <div className="hero-actions hero-seq hero-4">
            <Button to="/register">Get Started</Button>
            <Button variant="outline" to="/login" className="hero-login-btn">
              Login
            </Button>
          </div>
          <div className="download-row hero-seq hero-4">
            <button
              type="button"
              className="store-chip store-chip-btn"
              aria-label="Download on App Store"
              onClick={() => openStoreModal('App Store')}
            >
              <span></span>
              <small>App Store</small>
            </button>
            <button
              type="button"
              className="store-chip store-chip-btn"
              aria-label="Get it on Google Play"
              onClick={() => openStoreModal('Google Play')}
            >
              <span>▶</span>
              <small>Google Play</small>
            </button>
          </div>
          <div className="hero-meta-strip hero-seq hero-4">
            <span className="stat-chip">5M+ transfers monthly</span>
            <span className="stat-chip">24/7 fraud monitoring</span>
            <span className="stat-chip">CBN compliant</span>
          </div>
        </div>

        <div className="hero-dashboard card-glass">
          <div className="dashboard-top">
            <div>
              <p className="dash-label">Available Balance</p>
              <h3>₦1,245,908.50</h3>
            </div>
            <span className="status-pill">Secured</span>
          </div>

          <div className="chart-area">
            <div className="chart-line" />
          </div>

          <div className="tx-list">
            <div className="tx-item">
              <div>
                <p>CloudOps Invoice</p>
                <span>Today, 8:22 AM</span>
              </div>
              <strong>- ₦24,500.00</strong>
            </div>
            <div className="tx-item">
              <div>
                <p>Salary Credit</p>
                <span>Mar 29, 9:01 PM</span>
              </div>
              <strong className="money-in">+ ₦172,450.00</strong>
            </div>
            <div className="tx-item">
              <div>
                <p>Transfer to Maria</p>
                <span>Mar 29, 1:40 PM</span>
              </div>
              <strong>- ₦4,850.00</strong>
            </div>
          </div>
        </div>
      </RevealSection>

      <RevealSection className="section" delay={0.15}>
        <div className="section-heading">
          <p className="eyebrow">Why Trusta</p>
          <h2>Premium tools for modern money management</h2>
        </div>

        <div className="feature-grid">
          {features.map((feature) => (
            <Card key={feature.title} className="feature-card card-glass">
              <span className="feature-icon">{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </Card>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="section" delay={0.2}>
        <div className="section-heading">
          <p className="eyebrow">How It Works</p>
          <h2>Get started in three smooth steps</h2>
        </div>

        <div className="steps-grid">
          {steps.map((step, index) => (
            <Card key={step.title} className="step-card card-glass">
              <span className="step-index">0{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </Card>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="section" delay={0.25}>
        <div className="cta card-glass">
          <h2>Take Control of Your Financial Future</h2>
          <p>Join thousands of users managing money smarter with Trusta Bank.</p>
          <Button to="/register">Create Free Account</Button>
        </div>
      </RevealSection>

      <RevealSection className="section micro-note" delay={0.3}>
        <p>
          Trusta is built with bank-grade controls, transparent fees, and speed-first infrastructure.
          <Link to="/about"> Learn more about our mission.</Link>
        </p>
      </RevealSection>

      {storeModal.open &&
        createPortal(
          <div className="store-modal-overlay" role="presentation" onClick={closeStoreModal}>
            <div className="store-modal card-glass" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
              <p className="eyebrow">Mobile App Update</p>
              <h3>{storeModal.store} is not available yet</h3>
              <p>
                We're finalizing release checks and approvals. The app will be available soon, and we appreciate your patience.
              </p>
              <button type="button" className="btn btn-primary" onClick={closeStoreModal}>
                Close
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}

export default Home
