import Card from '../components/Card'
import RevealSection from '../components/RevealSection'

function PrivacyPolicy() {
  return (
    <div className="page page-load legal-page">
      <RevealSection className="section page-top-hero hero-theme-contact" delay={0.1}>
        <div className="section-heading">
          <p className="eyebrow">Privacy</p>
          <h1>Privacy Policy</h1>
          <p className="contact-intro">
            This personal project respects your privacy. This page explains what data is collected and how it is used.
          </p>
        </div>
      </RevealSection>

      <RevealSection className="section" delay={0.15}>
        <Card className="card-glass legal-card">
          <h2>What We Collect</h2>
          <ul>
            <li>Basic form details you submit in contact or signup screens.</li>
            <li>Anonymous usage data for improving user experience.</li>
            <li>No payment card storage in this frontend-only personal project.</li>
          </ul>
        </Card>
      </RevealSection>

      <RevealSection className="section" delay={0.2}>
        <Card className="card-glass legal-card">
          <h2>How Data Is Used</h2>
          <ul>
            <li>To respond to support messages and application interest.</li>
            <li>To improve interface performance and reliability.</li>
            <li>To monitor security and prevent abuse.</li>
          </ul>
        </Card>
      </RevealSection>

      <RevealSection className="section" delay={0.25}>
        <Card className="card-glass legal-card">
          <h2>Your Choices</h2>
          <p>
            You can request data updates or deletion by contacting support. Because this is a personal demo project,
            policy details may evolve as backend systems are introduced.
          </p>
        </Card>
      </RevealSection>
    </div>
  )
}

export default PrivacyPolicy
