import Button from '../components/Button'
import Input from '../components/Input'
import Card from '../components/Card'
import RevealSection from '../components/RevealSection'
import CardLogo from '../components/CardLogo'

const contactMethods = [
    {
        title: 'Email Support',
        description: 'Prefer email?',
        contact: 'trustbank304@gmail.com',
        response: 'Response in 2-4 hours',
    },
    {
        title: 'Live Chat',
        description: 'Need immediate help?',
        contact: 'Available 24/7',
        response: 'Typical response: 1 min',
    },
    {
        title: 'Phone Support',
        description: 'Call us directly',
        contact: '07067110127',
        response: 'Business hours: 8am-6pm WAT',
    },
    {
        title: 'Social Media',
        description: 'Follow our updates',
        contact: '@dev_ojurithm | @ad3mola.404',
        response: 'Chat on X and Instagram',
    },
    {
        title: 'WhatsApp Support',
        description: 'Quick support on chat',
        contact: '07067110127',
        response: 'Typical response: under 5 mins',
    },
    {
        title: 'Branch Appointment',
        description: 'Need in-person support?',
        contact: 'Book via trustbank304@gmail.com',
        response: 'Slots available weekdays',
    },
]

function Contact() {
    return (
        <div className="page page-load">
            <RevealSection className="section page-top-hero hero-theme-contact" delay={0.1}>
                <div className="section-heading text-center">
                    <p className="eyebrow">Get In Touch</p>
                    <h1>We're here to help</h1>
                    <p className="contact-intro">
                        Have questions? Our support team is ready to assist you every step of the way.
                    </p>
                </div>
            </RevealSection>

            <RevealSection className="section" delay={0.15}>
                <div className="contact-methods">
                    {contactMethods.map((method) => (
                        <Card key={method.title} className="contact-card card-glass">
                            <CardLogo />
                            <h3>{method.title}</h3>
                            <p className="contact-desc">{method.description}</p>
                            <div className="contact-info">
                                <strong>{method.contact}</strong>
                                <span>{method.response}</span>
                            </div>
                        </Card>
                    ))}
                </div>
            </RevealSection>

            <RevealSection className="section" delay={0.2}>
                <div className="contact-form-wrapper">
                    <Card className="card-glass">
                        <h2>Send us a message</h2>
                        <form className="contact-form">
                            <div className="form-row">
                                <Input id="name" label="Full Name" type="text" filter="text" placeholder="Your name" required />
                                <Input
                                    id="email"
                                    label="Email Address"
                                    type="email"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <Input id="subject" label="Subject" type="text" filter="text" placeholder="How can we help?" required />
                                <Input id="phone" label="Phone (Optional)" type="text" filter="numeric" inputMode="numeric" pattern="[0-9]*" placeholder="080..." />
                            </div>

                            <div className="form-group">
                                <label htmlFor="message" className="form-label">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    className="form-textarea"
                                    placeholder="Tell us more..."
                                    rows="6"
                                    onInput={(event) => {
                                        event.currentTarget.value = event.currentTarget.value.replace(/[^A-Za-z\s'-]/g, '')
                                    }}
                                    required
                                />
                            </div>

                            <Button type="submit" fullWidth>
                                Send Message
                            </Button>
                        </form>
                    </Card>
                </div>
            </RevealSection>

            <RevealSection className="section" delay={0.25}>
                <Card className="offices-card card-glass">
                    <h2>Our Offices</h2>
                    <div className="offices-grid">
                        <div className="office">
                            <h4>Lagos Head Office</h4>
                            <p>Ikoyi, Lagos State</p>
                            <p>08067110127</p>
                        </div>
                        <div className="office">
                            <h4>Abuja Office</h4>
                            <p>Maitama, Abuja FCT</p>
                            <p>08067110127</p>
                        </div>
                        <div className="office">
                            <h4>Business Hours</h4>
                            <p>Monday - Friday: 8am - 6pm WAT</p>
                            <p>Saturday: 10am - 3pm WAT</p>
                        </div>
                    </div>
                </Card>
            </RevealSection>
        </div>
    )
}

export default Contact
