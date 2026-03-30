import Card from '../components/Card'
import Button from '../components/Button'
import RevealSection from '../components/RevealSection'
import CardLogo from '../components/CardLogo'

const solutions = [
  {
    title: 'Everyday Banking',
    subtitle: 'Fast payments and bills',
    description:
      'Transfer money instantly, pay utility bills, top up airtime, and automate recurring expenses from one simple wallet.',
    points: ['Instant bank transfers', 'Bills and subscriptions', 'Airtime and data top-up'],
  },
  {
    title: 'Business Collection',
    subtitle: 'Get paid with confidence',
    description:
      'Accept customer payments online and offline, track settlements, and manage your cash flow with smart reporting.',
    points: ['Payment links and QR', 'Settlement timeline', 'Business analytics dashboard'],
  },
  {
    title: 'Savings and Rewards',
    subtitle: 'Grow every naira',
    description:
      'Set goals, auto-save daily, and unlock cashback rewards with secure plans designed for disciplined growth.',
    points: ['Automated savings rules', 'Goal-based wallet pockets', 'Cashback reward milestones'],
  },
]

function Solutions() {
  return (
    <div className="page page-load">
      <RevealSection className="section page-top-hero hero-theme-solutions" delay={0.1}>
        <div className="section-heading">
          <p className="eyebrow">Banking Solutions</p>
          <h1>Built for individuals, families, and growing businesses</h1>
          <p className="solutions-intro">
            Trusta gives you practical tools to spend smarter, save consistently, and scale your business operations.
          </p>
        </div>
      </RevealSection>

      <RevealSection className="section" delay={0.14}>
        <div className="solutions-grid">
          {solutions.map((item) => (
            <Card key={item.title} className="solution-card card-glass">
              <CardLogo />
              <p className="solution-kicker">{item.subtitle}</p>
              <h3>{item.title}</h3>
              <p className="plan-desc">{item.description}</p>
              <ul className="features-list">
                {item.points.map((point) => (
                  <li key={point}>
                    <span className="checkmark">✓</span>
                    {point}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="section" delay={0.15}>
        <Card className="faq-highlight card-glass">
          <h2>Why this works for Nigeria</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>Optimized for local rails</h4>
              <p>Built with local transfer flows, instant notifications, and seamless wallet funding options.</p>
            </div>
            <div className="faq-item">
              <h4>Security-first controls</h4>
              <p>Biometric checks, OTP verification, and real-time risk monitoring protect every transaction.</p>
            </div>
            <div className="faq-item">
              <h4>Designed for mobile users</h4>
              <p>Simple app-first interactions for quick actions, even on lower bandwidth connections.</p>
            </div>
            <div className="faq-item">
              <h4>Scale-ready for merchants</h4>
              <p>From solo vendors to larger teams, tools are built to grow with your business.</p>
            </div>
            <div className="faq-item">
              <h4>Built for unstable networks</h4>
              <p>Fast-loading flows and resilient retries help users complete actions on weak connections.</p>
            </div>
            <div className="faq-item">
              <h4>Transparent transaction tracking</h4>
              <p>Clear pending and completed states keep users informed and reduce support-related confusion.</p>
            </div>
          </div>
          <div className="solutions-cta">
            <Button to="/register">Open a Trusta Account</Button>
          </div>
        </Card>
      </RevealSection>
    </div>
  )
}

export default Solutions
