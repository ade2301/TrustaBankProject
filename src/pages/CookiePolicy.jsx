import Card from '../components/Card'
import RevealSection from '../components/RevealSection'

function CookiePolicy() {
    return (
        <div className="page page-load legal-page">
            <RevealSection className="section page-top-hero hero-theme-contact" delay={0.1}>
                <div className="section-heading">
                    <p className="eyebrow">Cookies</p>
                    <h1>Cookie Policy</h1>
                    <p className="contact-intro">
                        This page describes how cookies and local storage are used for a smoother experience.
                    </p>
                </div>
            </RevealSection>

            <RevealSection className="section" delay={0.15}>
                <Card className="card-glass legal-card">
                    <h2>Essential Cookies</h2>
                    <ul>
                        <li>Theme preference storage for light and dark mode.</li>
                        <li>Basic session consistency for app navigation behavior.</li>
                    </ul>
                </Card>
            </RevealSection>

            <RevealSection className="section" delay={0.2}>
                <Card className="card-glass legal-card">
                    <h2>Analytics Cookies</h2>
                    <p>
                        Lightweight analytics may be introduced later to understand which sections users engage with most.
                        No personally sensitive tracking is intended.
                    </p>
                </Card>
            </RevealSection>

            <RevealSection className="section" delay={0.25}>
                <Card className="card-glass legal-card">
                    <h2>Managing Cookies</h2>
                    <p>
                        You can clear browser storage at any time from your browser settings. Future releases will include
                        more granular controls in an on-page cookie preference center.
                    </p>
                </Card>
            </RevealSection>
        </div>
    )
}

export default CookiePolicy
