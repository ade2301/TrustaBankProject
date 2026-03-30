import { useEffect, useRef, useState } from 'react'

function RevealSection({ children, className = '', delay = 0, once = true }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) {
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          if (once) {
            observer.unobserve(node)
          }
        } else if (!once) {
          setVisible(false)
        }
      },
      {
        threshold: 0.2,
      },
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [once])

  return (
    <section
      ref={ref}
      className={`reveal-section ${visible ? 'is-visible' : ''} ${className}`.trim()}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </section>
  )
}

export default RevealSection
