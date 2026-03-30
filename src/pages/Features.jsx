import Card from '../components/Card'
import RevealSection from '../components/RevealSection'
import CardLogo from '../components/CardLogo'

const featureCategories = [
  {
    title: 'Payment & Transfers',
    features: [
      {
        title: 'Instant Local Transfers',
        description: 'Send money to any Nigerian account in real-time with live tracking.',
      },
      {
        title: 'International Remittance',
        description: 'Support for USD, GBP, EUR with competitive exchange rates.',
      },
      {
        title: 'Bill Payments',
        description: 'Pay electricity, internet, cable directly from your Trusta wallet.',
      },
      {
        title: 'Airtime & Data',
        description: 'Top up phone credit anytime, anywhere at no extra cost.',
      },
      {
        title: 'Scheduled Transfers',
        description: 'Plan one-time or recurring transfers ahead and let Trusta execute automatically.',
      },
      {
        title: 'Payment Request Links',
        description: 'Generate secure payment links and get paid quickly from customers or contacts.',
      },
    ],
  },
  {
    title: 'Security & Protection',
    features: [
      {
        title: 'Bank-Grade Encryption',
        description: '256-bit SSL and end-to-end encryption for all transactions.',
      },
      {
        title: 'Biometric Security',
        description: 'Fingerprint & facial recognition for mobile app protection.',
      },
      {
        title: '24/7 Fraud Monitoring',
        description: 'Real-time detection and instant alerts for suspicious activity.',
      },
      {
        title: 'Two-Factor Authentication',
        description: 'SMS or app-based 2FA for added account protection.',
      },
      {
        title: 'Transaction Limits',
        description: 'Set daily transfer and spending limits to reduce risk and stay in control.',
      },
      {
        title: 'Device Management',
        description: 'Review authorized devices and instantly remove unfamiliar login sessions.',
      },
    ],
  },
  {
    title: 'Smart Savings',
    features: [
      {
        title: 'Auto-Save Goals',
        description: 'Set savings targets and automate deposits to reach them faster.',
      },
      {
        title: 'High-Yield Savings',
        description: 'Earn industry-leading interest rates on your savings balance.',
      },
      {
        title: 'Budgeting Tools',
        description: 'Track spending by category and get smart budgeting insights.',
      },
      {
        title: 'Investment Access',
        description: 'Invest in stocks, bonds, and mutual funds with low minimums.',
      },
      {
        title: 'Round-Up Savings',
        description: 'Automatically save the spare change from purchases into your target goals.',
      },
      {
        title: 'Savings Challenges',
        description: 'Join weekly and monthly savings plans that keep you accountable and consistent.',
      },
    ],
  },
  {
    title: 'Business Tools',
    features: [
      {
        title: 'Business Accounts',
        description: 'Legal business accounts with multi-user access and permissions.',
      },
      {
        title: 'Invoice & Invoicing',
        description: 'Accept payments with custom invoices and automatic reconciliation.',
      },
      {
        title: 'Team Collaboration',
        description: 'Manage team members, delegates, and spending limits independently.',
      },
      {
        title: 'API Integration',
        description: 'Connect Trusta to your systems with our powerful REST API.',
      },
      {
        title: 'Bulk Payouts',
        description: 'Send salaries or vendor payments to multiple beneficiaries in one secure batch.',
      },
      {
        title: 'Role-Based Access',
        description: 'Assign finance permissions to team members and approve sensitive actions safely.',
      },
    ],
  },
]

function Features() {
  return (
    <div className="page page-load">
      <RevealSection className="section features-hero" delay={0.1}>
        <div className="section-heading text-center">
          <p className="eyebrow">Powerful Features</p>
          <h1>Everything you need for modern banking</h1>
        </div>
      </RevealSection>

      {featureCategories.map((category, idx) => (
        <RevealSection key={category.title} className="section" delay={0.15 + idx * 0.1}>
          <div className="feature-category">
            <h2>{category.title}</h2>
            <div className="feature-grid features-3col">
              {category.features.map((feature) => (
                <Card key={feature.title} className="feature-card card-glass">
                  <CardLogo />
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </RevealSection>
      ))}
    </div>
  )
}

export default Features
