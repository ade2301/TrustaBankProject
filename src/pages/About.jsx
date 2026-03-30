import Card from '../components/Card'
import RevealSection from '../components/RevealSection'
import CardLogo from '../components/CardLogo'

const values = [
  {
    title: 'Trust by Design',
    text: 'Every flow is designed to be transparent, explainable, and user-first.',
  },
  {
    title: 'Security by Default',
    text: 'Layered verification and 24/7 fraud monitoring across every transaction.',
  },
  {
    title: 'Speed with Reliability',
    text: 'Fast payment rails with resilient infrastructure and clear status visibility.',
  },
]

function About() {
  return (
    <div className="page page-load about-page">
      <RevealSection className="section about-hero page-top-hero hero-theme-about" delay={0.1}>
        <p className="eyebrow">About Trusta</p>
        <h1>We are building the most trusted banking experience for digital-first users.</h1>
        <p>
          Trusta Bank combines secure infrastructure with intuitive design so people and businesses can move money confidently.
        </p>
      </RevealSection>

      <RevealSection className="section" delay={0.15}>
        <div className="feature-grid">
          {values.map((value) => (
            <Card key={value.title} className="feature-card card-glass">
              <CardLogo />
              <h3>{value.title}</h3>
              <p>{value.text}</p>
            </Card>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="section about-metrics" delay={0.2}>
        <Card className="metric-card card-glass">
          <h2>99.99%</h2>
          <p>Platform uptime for consistent access when your finances matter most.</p>
        </Card>
        <Card className="metric-card card-glass">
          <h2>120+</h2>
          <p>Countries supported for global payments and money movement.</p>
        </Card>
        <Card className="metric-card card-glass">
          <h2>24/7</h2>
          <p>Fraud and risk monitoring with instant alerting for suspicious activity.</p>
        </Card>
      </RevealSection>
    </div>
  )
}

export default About
