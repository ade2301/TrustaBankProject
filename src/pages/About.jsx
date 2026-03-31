import { useEffect, useRef, useState } from 'react'
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

function AnimatedMetric({
  end,
  duration = 1900,
  decimals = 0,
  suffix = '',
  prefix = '',
}) {
  const [value, setValue] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) {
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.35 },
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) {
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
      }
    }

    frameId = window.requestAnimationFrame(tick)

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [duration, end, isVisible])

  const displayValue = decimals > 0 ? value.toFixed(decimals) : String(Math.round(value))

  return (
    <span ref={elementRef} className="metric-value">
      {prefix}
      {displayValue}
      {suffix}
    </span>
  )
}

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
          <h2>
            <AnimatedMetric end={99.99} decimals={2} suffix="%" />
          </h2>
          <p>Platform uptime for consistent access when your finances matter most.</p>
        </Card>
        <Card className="metric-card card-glass">
          <h2>
            <AnimatedMetric end={120} suffix="+" />
          </h2>
          <p>Countries supported for global payments and money movement.</p>
        </Card>
        <Card className="metric-card card-glass">
          <h2>
            <AnimatedMetric end={24} suffix="/7" />
          </h2>
          <p>Fraud and risk monitoring with instant alerting for suspicious activity.</p>
        </Card>
      </RevealSection>
    </div>
  )
}

export default About
