import { Link } from 'react-router-dom'
import { useState } from 'react'
import trustaLogo from '../assets/trusta-logo-final.png'

function FooterCertificationIcon({ variant }) {
  if (variant === 'ndic') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3 20 6.5V12c0 5-3.4 7.9-8 9-4.6-1.1-8-4-8-9V6.5L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="m9.3 12 1.8 1.8 3.6-3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (variant === 'ssl') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7.5 10.2V7.8a4.5 4.5 0 0 1 9 0v2.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="5" y="10.2" width="14" height="9.2" rx="2.2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 13.3v2.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }

  if (variant === 'cbn') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3 5.5 6.2v4.7c0 4.2 2.8 7.4 6.5 9 3.7-1.6 6.5-4.8 6.5-9V6.2L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M8.4 12.4h7.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12 8.4v7.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }

  return null
}

function Footer() {
  const [email, setEmail] = useState('')

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    setEmail('')
  }

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-brand">
            <img src={trustaLogo} alt="Trusta Bank" className="brand-logo" />
            <div>
              <p className="brand-desc">Reimagining banking for Africa</p>
            </div>
          </div>
          <p className="footer-mission">
            Trusta is revolutionizing how Africans manage, save, and invest their money with secure,
            fast, and affordable digital banking solutions.
          </p>
        </div>

        <div className="footer-section">
          <h4>Products</h4>
          <ul className="footer-links">
            <li>
              <Link to="/features">Features</Link>
            </li>
            <li>
              <Link to="/solutions">Solutions</Link>
            </li>
            <li>
              <Link to="/register">Mobile App</Link>
            </li>
            <li>
              <Link to="/features">Security</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Company</h4>
          <ul className="footer-links">
            <li>
              <Link to="/about">About Us</Link>
            </li>
            <li>
              <Link to="/careers">Careers</Link>
            </li>
            <li>
              <Link to="/blog">Blog</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Legal</h4>
          <ul className="footer-links">
            <li>
              <Link to="/privacy-policy">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/about">Terms of Service</Link>
            </li>
            <li>
              <Link to="/features">Compliance</Link>
            </li>
            <li>
              <Link to="/cookie-policy">Cookie Settings</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section newsletter-section">
          <h4>Stay Updated</h4>
          <p>Subscribe to get the latest news and updates from Trusta.</p>
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Subscribe</button>
          </form>
          <div className="social-links">
            <a href="https://x.com/dev_ojurithm" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4.2 4h3.5l4.8 6.5L17.9 4h2l-6.5 7.5L20 20h-3.5l-5.2-7.1L5.4 20h-2.1l7-8.1L4.2 4Z"
                  fill="currentColor"
                />
              </svg>
            </a>
            <a href="#" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M6.2 9.4H3.6V20h2.6V9.4Zm.2-3.2c0-.9-.7-1.6-1.6-1.6s-1.6.7-1.6 1.6.7 1.6 1.6 1.6 1.6-.7 1.6-1.6ZM10.1 20h2.6v-5.2c0-1.4.4-2.8 2.1-2.8 1.7 0 1.7 1.6 1.7 2.9V20h2.6v-5.7c0-2.8-.6-5-3.8-5-1.5 0-2.5.8-2.9 1.6h0V9.4h-2.5c0 .8.1 10.6.1 10.6Z"
                  fill="currentColor"
                />
              </svg>
            </a>
            <a href="https://www.instagram.com/ad3mola.404" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5.4" stroke="currentColor" strokeWidth="1.9" />
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.9" />
                <circle cx="17.3" cy="6.8" r="1" fill="currentColor" />
              </svg>
            </a>
            <a href="#" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M13.7 20.8v-7.1h2.5l.4-2.9h-2.9V9c0-.9.3-1.5 1.6-1.5h1.4V4.8c-.2 0-.9-.1-1.9-.1-2.7 0-4.4 1.6-4.4 4.5v1.6H8.3v2.9h2.1v7.1h3.3Z"
                  fill="currentColor"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Trusta Bank. All rights reserved.</p>
        <div className="footer-certifications">
          <span className="footer-cert-item">
            <FooterCertificationIcon variant="ndic" />
            <span>NDIC Safeguarded</span>
          </span>
          <span className="footer-cert-item">
            <FooterCertificationIcon variant="ssl" />
            <span>SSL Certified</span>
          </span>
          <span className="footer-cert-item">
            <FooterCertificationIcon variant="cbn" />
            <span>CBN Compliant</span>
          </span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
