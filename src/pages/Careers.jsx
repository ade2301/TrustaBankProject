import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import RevealSection from '../components/RevealSection'
import CardLogo from '../components/CardLogo'

const WHATSAPP_JOB_CONTACT = '2347067110127'

const buildWhatsAppApplyLink = (job) => {
    const message = `Hello Trusta Bank, I want to apply for the ${job.title} role (${job.location}). Please share the next steps.`
    return `https://wa.me/${WHATSAPP_JOB_CONTACT}?text=${encodeURIComponent(message)}`
}

const jobs = [
    {
        id: 'backend-engineer',
        title: 'Senior Backend Engineer',
        company: 'Trusta Bank',
        location: 'Lagos, Nigeria',
        workMode: 'Hybrid',
        employmentType: 'Full-time',
        level: 'Senior',
        salaryRange: 'N14,000,000 - N19,000,000 yearly',
        postedDate: 'Mar 18, 2026',
        deadline: 'Apr 25, 2026',
        department: 'Engineering',
        description: 'Build scalable payment infrastructure for millions of users.',
        overview:
            'You will design and ship high-throughput backend systems for transfers, savings, and account services used daily across Nigeria.',
        responsibilities: [
            'Architect resilient APIs for core banking and payment flows.',
            'Improve database performance and reduce p95 latency across critical endpoints.',
            'Collaborate with product and security teams to launch compliant features.',
            'Mentor engineers and contribute to engineering standards.',
        ],
        requirements: [
            '5+ years building backend systems with Node.js or JVM ecosystems.',
            'Strong PostgreSQL and caching fundamentals.',
            'Hands-on experience with event-driven systems and observability.',
            'Understanding of secure coding and regulated environments.',
        ],
        perks: ['Health insurance', 'Pension', 'Hybrid work allowance', 'Annual learning budget'],
        process: ['CV review', 'Technical interview', 'System design session', 'Final culture interview'],
    },
    {
        id: 'product-designer',
        title: 'Product Designer',
        company: 'Trusta Bank',
        location: 'Remote',
        workMode: 'Remote',
        employmentType: 'Full-time',
        level: 'Mid-level',
        salaryRange: 'N9,000,000 - N13,000,000 yearly',
        postedDate: 'Mar 20, 2026',
        deadline: 'Apr 28, 2026',
        department: 'Product Design',
        description: 'Design beautiful, intuitive experiences for our mobile and web platforms.',
        overview:
            'You will own end-to-end product design for high-impact banking journeys, from discovery to shipped UI.',
        responsibilities: [
            'Lead user research and convert insights into clear product flows.',
            'Create polished interfaces and maintain design system consistency.',
            'Partner closely with engineers through implementation and QA.',
            'Measure UX outcomes and iterate based on data.',
        ],
        requirements: [
            '3+ years designing consumer digital products.',
            'Strong portfolio showing UX thinking and visual craft.',
            'Figma proficiency and component-driven design systems experience.',
            'Ability to communicate design rationale to cross-functional teams.',
        ],
        perks: ['Remote stipend', 'Health plan', 'Quarterly design offsites', 'Learning grants'],
        process: ['Portfolio screening', 'Design challenge', 'Cross-functional interview', 'Final interview'],
    },
    {
        id: 'finance-ops-specialist',
        title: 'Finance Operations Specialist',
        company: 'Trusta Bank',
        location: 'Lagos, Nigeria',
        workMode: 'On-site',
        employmentType: 'Full-time',
        level: 'Mid-level',
        salaryRange: 'N7,500,000 - N10,500,000 yearly',
        postedDate: 'Mar 14, 2026',
        deadline: 'Apr 20, 2026',
        department: 'Finance Operations',
        description: 'Manage transactions, compliance, and financial operations at scale.',
        overview:
            'You will keep Trusta Bank transaction operations accurate, fast, and compliant while improving internal controls.',
        responsibilities: [
            'Reconcile settlement reports and investigate discrepancies quickly.',
            'Track daily liquidity and support treasury planning.',
            'Partner with compliance on filing and operational checks.',
            'Improve SOPs and automation for recurring workflows.',
        ],
        requirements: [
            '3+ years in financial operations or banking ops.',
            'Advanced spreadsheet and reporting skills.',
            'Strong understanding of reconciliation and controls.',
            'High attention to detail and proactive communication.',
        ],
        perks: ['13th month bonus', 'HMO', 'Meal subsidy', 'Performance bonus'],
        process: ['CV review', 'Ops case study', 'Team interview', 'Leadership interview'],
    },
    {
        id: 'devops-engineer',
        title: 'DevOps Engineer',
        company: 'Trusta Bank',
        location: 'Remote',
        workMode: 'Remote',
        employmentType: 'Full-time',
        level: 'Senior',
        salaryRange: 'N13,000,000 - N18,500,000 yearly',
        postedDate: 'Mar 12, 2026',
        deadline: 'Apr 22, 2026',
        department: 'Platform Engineering',
        description: 'Maintain and optimize our cloud infrastructure for 99.99% uptime.',
        overview:
            'You will improve platform reliability, delivery speed, and security across Trusta Bank services.',
        responsibilities: [
            'Maintain CI/CD pipelines and environment consistency.',
            'Implement monitoring and incident response automation.',
            'Harden infrastructure using security best practices.',
            'Support developers with tooling and deployment workflows.',
        ],
        requirements: [
            '4+ years in cloud infrastructure and DevOps roles.',
            'Hands-on with AWS, Kubernetes, and Infrastructure as Code.',
            'Strong Linux and networking fundamentals.',
            'Experience building SLO/SLI driven operations.',
        ],
        perks: ['Remote setup budget', 'Internet allowance', 'HMO', 'Certification support'],
        process: ['CV review', 'Infra deep dive', 'Practical task', 'Final interview'],
    },
    {
        id: 'community-manager',
        title: 'Community Manager',
        company: 'Trusta Bank',
        location: 'Lagos, Nigeria',
        workMode: 'Hybrid',
        employmentType: 'Full-time',
        level: 'Mid-level',
        salaryRange: 'N6,500,000 - N9,000,000 yearly',
        postedDate: 'Mar 16, 2026',
        deadline: 'Apr 26, 2026',
        department: 'Brand & Community',
        description: 'Build and engage our community across social platforms and events.',
        overview:
            'You will grow a trusted community around financial literacy and modern digital banking experiences.',
        responsibilities: [
            'Plan and run online and in-person community events.',
            'Manage creator and campus ambassador partnerships.',
            'Collaborate with support and product teams to close feedback loops.',
            'Track engagement KPIs and share monthly insight reports.',
        ],
        requirements: [
            '3+ years in community, social, or brand growth roles.',
            'Excellent writing and public communication skills.',
            'Strong event planning and campaign execution ability.',
            'Comfort with analytics dashboards and experimentation.',
        ],
        perks: ['Travel support', 'Wellness package', 'HMO', 'Performance incentives'],
        process: ['CV review', 'Campaign case study', 'Panel interview', 'Final interview'],
    },
    {
        id: 'compliance-risk-officer',
        title: 'Compliance & Risk Officer',
        company: 'Trusta Bank',
        location: 'Lagos, Nigeria',
        workMode: 'On-site',
        employmentType: 'Full-time',
        level: 'Senior',
        salaryRange: 'N11,500,000 - N16,000,000 yearly',
        postedDate: 'Mar 10, 2026',
        deadline: 'Apr 18, 2026',
        department: 'Risk & Compliance',
        description: 'Ensure regulatory compliance and manage operational risks.',
        overview:
            'You will lead risk and compliance monitoring, ensuring all banking operations align with regulatory expectations.',
        responsibilities: [
            'Maintain compliance frameworks, policies, and reporting cadences.',
            'Coordinate internal audits and close findings effectively.',
            'Run risk assessments for new products and changes.',
            'Train teams on controls, KYC/AML, and governance practices.',
        ],
        requirements: [
            '5+ years in compliance, audit, or risk management.',
            'Strong knowledge of Nigerian financial regulations.',
            'Excellent documentation and stakeholder management skills.',
            'Relevant certification is an added advantage.',
        ],
        perks: ['HMO', 'Pension', 'Training sponsorship', 'Annual bonus'],
        process: ['CV review', 'Regulatory scenario interview', 'Leadership interview', 'Offer stage'],
    },
]

const values = [
    {
        title: 'Ownership',
        description: 'We take full responsibility for our impact on users and society.',
    },
    {
        title: 'Excellence',
        description: 'We strive for the highest quality in everything we build and deliver.',
    },
    {
        title: 'Diversity',
        description: 'We embrace diverse perspectives and create an inclusive workplace.',
    },
    {
        title: 'Innovation',
        description: 'We constantly push boundaries and reimagine what\'s possible in modern banking.',
    },
    {
        title: 'Customer Empathy',
        description: 'We listen closely and build around real customer pain points, not assumptions.',
    },
    {
        title: 'Integrity',
        description: 'We choose what is right, transparent, and compliant in every decision we make.',
    },
]

function AnimatedMetric({ end, duration = 1900, suffix = '' }) {
    const [value, setValue] = useState(0)
    const [hasAnimated, setHasAnimated] = useState(false)

    useEffect(() => {
        if (hasAnimated) {
            return undefined
        }

        let frameId = null
        const start = performance.now()

        const tick = (timestamp) => {
            const progress = Math.min((timestamp - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setValue(end * eased)

            if (progress < 1) {
                frameId = window.requestAnimationFrame(tick)
            } else {
                setHasAnimated(true)
            }
        }

        frameId = window.requestAnimationFrame(tick)

        return () => {
            if (frameId !== null) {
                window.cancelAnimationFrame(frameId)
            }
        }
    }, [duration, end, hasAnimated])

    return (
        <span className="metric-value">
            {Math.round(value)}
            {suffix}
        </span>
    )
}

function Careers() {
    const [selectedJob, setSelectedJob] = useState(null)

    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                setSelectedJob(null)
            }
        }

        if (selectedJob) {
            document.body.style.overflow = 'hidden'
            window.addEventListener('keydown', onKeyDown)
        }

        return () => {
            document.body.style.overflow = ''
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [selectedJob])

    return (
        <div className="page page-load">
            <RevealSection className="section page-top-hero hero-theme-careers" delay={0.1}>
                <div className="section-heading">
                    <p className="eyebrow">Join Our Team</p>
                    <h1>Build the future of banking in Africa</h1>
                    <p className="careers-intro">
                        We're hiring talented people to help us revolutionize digital banking. Join us in our mission.
                    </p>
                </div>
            </RevealSection>

            <RevealSection className="section" delay={0.15}>
                <h2 className="section-title">Our Values</h2>
                <div className="values-grid">
                    {values.map((value) => (
                        <Card key={value.title} className="value-card card-glass">
                            <CardLogo />
                            <h3>{value.title}</h3>
                            <p>{value.description}</p>
                        </Card>
                    ))}
                </div>
            </RevealSection>

            <RevealSection className="section" delay={0.2}>
                <h2 className="section-title">Open Positions</h2>
                <div className="jobs-list">
                    {jobs.map((job) => (
                        <Card key={job.id} className="job-card card-glass job-hover">
                            <CardLogo />
                            <div className="job-header">
                                <div>
                                    <h3>{job.title}</h3>
                                    <div className="job-meta">
                                        <span className="job-location">📍 {job.location}</span>
                                        <span className="job-type">{job.workMode}</span>
                                        <span className="job-level">{job.level}</span>
                                    </div>
                                </div>
                            </div>
                            <p>{job.description}</p>
                            <Button variant="outline" onClick={() => setSelectedJob(job)}>
                                View Position
                            </Button>
                        </Card>
                    ))}
                </div>
            </RevealSection>

            <RevealSection className="section about-metrics" delay={0.23}>
                <Card className="metric-card card-glass">
                    <h2>
                        <AnimatedMetric end={jobs.length} suffix="+" />
                    </h2>
                    <p>Open roles currently available across teams.</p>
                </Card>
                <Card className="metric-card card-glass">
                    <h2>
                        <AnimatedMetric end={jobs.filter((job) => job.workMode === 'Remote').length} />
                    </h2>
                    <p>Remote positions you can apply for from anywhere.</p>
                </Card>
                <Card className="metric-card card-glass">
                    <h2>
                        <AnimatedMetric end={values.length} />
                    </h2>
                    <p>Core values that guide our culture and decisions.</p>
                </Card>
            </RevealSection>

            <RevealSection className="section" delay={0.25}>
                <Card className="careers-cta card-glass">
                    <h2>Don't see your role?</h2>
                    <p>We're always looking for talented people. Send us your profile and let's chat!</p>
                    <Button to="/contact">Get In Touch</Button>
                </Card>
            </RevealSection>

            {selectedJob &&
                createPortal(
                    <div className="job-modal-overlay" role="presentation" onClick={() => setSelectedJob(null)}>
                        <div
                            className="job-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="job-modal-title"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="job-modal-content">
                                <div className="job-modal-header">
                                    <p className="job-modal-label">Position Details</p>
                                    <button
                                        type="button"
                                        className="job-modal-close"
                                        onClick={() => setSelectedJob(null)}
                                        aria-label="Close job details"
                                    >
                                        Close
                                    </button>
                                </div>

                                <div className="job-overview-top">
                                    <p className="eyebrow">Job Overview</p>
                                    <h2 id="job-modal-title">{selectedJob.title}</h2>
                                    <p className="job-overview-summary">{selectedJob.overview}</p>
                                </div>

                                <div className="job-overview-grid">
                                    <div className="job-overview-item">
                                        <span>Company</span>
                                        <strong>{selectedJob.company}</strong>
                                    </div>
                                    <div className="job-overview-item">
                                        <span>Location</span>
                                        <strong>{selectedJob.location}</strong>
                                    </div>
                                    <div className="job-overview-item">
                                        <span>Work mode</span>
                                        <strong>{selectedJob.workMode}</strong>
                                    </div>
                                    <div className="job-overview-item">
                                        <span>Employment type</span>
                                        <strong>{selectedJob.employmentType}</strong>
                                    </div>
                                    <div className="job-overview-item">
                                        <span>Salary range</span>
                                        <strong>{selectedJob.salaryRange}</strong>
                                    </div>
                                    <div className="job-overview-item">
                                        <span>Posted date</span>
                                        <strong>{selectedJob.postedDate}</strong>
                                    </div>
                                    <div className="job-overview-item">
                                        <span>Application deadline</span>
                                        <strong>{selectedJob.deadline}</strong>
                                    </div>
                                    <div className="job-overview-item">
                                        <span>Department</span>
                                        <strong>{selectedJob.department}</strong>
                                    </div>
                                </div>

                                <div className="job-modal-apply">
                                    <Button
                                        onClick={() => {
                                            window.open(buildWhatsAppApplyLink(selectedJob), '_blank', 'noopener,noreferrer')
                                            setSelectedJob(null)
                                        }}
                                    >
                                        Apply Now
                                    </Button>
                                </div>

                                <div className="job-detail-block">
                                    <h3>Role Summary</h3>
                                    <p>{selectedJob.description}</p>
                                </div>

                                <div className="job-detail-block">
                                    <h3>Key Responsibilities</h3>
                                    <ul>
                                        {selectedJob.responsibilities.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="job-detail-block">
                                    <h3>Requirements</h3>
                                    <ul>
                                        {selectedJob.requirements.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="job-detail-block">
                                    <h3>Perks & Benefits</h3>
                                    <ul>
                                        {selectedJob.perks.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="job-detail-block">
                                    <h3>Hiring Process</h3>
                                    <ol>
                                        {selectedJob.process.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    )
}

export default Careers
