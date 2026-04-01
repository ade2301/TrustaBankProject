function CardLogo({ variant = 'flow' }) {
  if (variant === 'transfer') {
    return (
      <span className="feature-icon card-logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M4 7h10m0 0L11 4m3 3-3 3M20 17H10m0 0 3 3m-3-3 3-3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  }

  if (variant === 'bill') {
    return (
      <span className="feature-icon card-logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M7 3h10v18l-2-1.3L13 21l-2-1.3L9 21l-2-1.3L5 21V3h2Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      </span>
    )
  }

  if (variant === 'mobile') {
    return (
      <span className="feature-icon card-logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <rect x="7" y="2.8" width="10" height="18.4" rx="2.2" stroke="currentColor" strokeWidth="1.75" />
          <path d="M10 6.8h4M11.7 17.7h.6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      </span>
    )
  }

  if (variant === 'calendar') {
    return (
      <span className="feature-icon card-logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <rect x="4" y="5" width="16" height="15" rx="2.3" stroke="currentColor" strokeWidth="1.75" />
          <path d="M8 3.5v3M16 3.5v3M4 9.2h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      </span>
    )
  }

  if (variant === 'link') {
    return (
      <span className="feature-icon card-logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M10 14 8 16a3 3 0 1 0 4.2 4.2l2-2M14 10l2-2a3 3 0 1 0-4.2-4.2l-2 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m9.5 14.5 5-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      </span>
    )
  }

  if (variant === 'lock') {
    return (
      <span className="feature-icon card-logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M7.5 10.2V7.8a4.5 4.5 0 0 1 9 0v2.4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="5" y="10.2" width="14" height="9.2" rx="2.2" stroke="currentColor" strokeWidth="1.75" />
          <path d="M12 13.3v2.1" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      </span>
    )
  }

  if (variant === 'alert') {
    return (
      <span className="feature-icon card-logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M12 3 3 19.5h18L12 3Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
          <path d="M12 9.2v4.9M12 17h.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      </span>
    )
  }

  if (variant === 'device') {
    return (
      <span className="feature-icon card-logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <rect x="3" y="5" width="11" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.75" />
          <rect x="10" y="12" width="11" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.75" />
        </svg>
      </span>
    )
  }

  if (variant === 'wallet') {
    return (
      <span className="feature-icon card-logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" stroke="currentColor" strokeWidth="1.75" />
          <path d="M15 12h3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      </span>
    )
  }

  if (variant === 'chart') {
    return (
      <span className="feature-icon card-logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M4 18h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M7 15v-4M12 15V8M17 15v-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      </span>
    )
  }

  if (variant === 'users') {
    return (
      <span className="feature-icon card-logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M8.5 11a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6ZM15.5 10a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z" stroke="currentColor" strokeWidth="1.75" />
          <path d="M4.5 18.8c.5-2.5 2.4-4 4-4s3.5 1.5 4 4M13 18.8c.35-1.8 1.7-2.9 3-2.9 1.3 0 2.65 1.1 3 2.9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      </span>
    )
  }

  if (variant === 'briefcase') {
    return (
      <span className="feature-icon card-logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <rect x="3.5" y="7" width="17" height="12" rx="2" stroke="currentColor" strokeWidth="1.75" />
          <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3.5 12h17" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      </span>
    )
  }

  if (variant === 'mail') {
    return (
      <span className="feature-icon card-logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <rect x="3.5" y="5" width="17" height="14" rx="2" stroke="currentColor" strokeWidth="1.75" />
          <path d="m4.8 7.2 7.2 5.7 7.2-5.7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  }

  if (variant === 'phone') {
    return (
      <span className="feature-icon card-logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M6.7 4.5h3l1.3 3.6-1.8 1.9a13 13 0 0 0 4.9 4.9l1.9-1.8 3.6 1.3v3c0 .9-.7 1.6-1.6 1.6A14.9 14.9 0 0 1 5.1 6.1c0-.9.7-1.6 1.6-1.6Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  }

  if (variant === 'chat') {
    return (
      <span className="feature-icon card-logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M5 6.2A2.2 2.2 0 0 1 7.2 4h9.6A2.2 2.2 0 0 1 19 6.2v6.6a2.2 2.2 0 0 1-2.2 2.2H11l-3.8 3v-3H7.2A2.2 2.2 0 0 1 5 12.8V6.2Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
          <path d="M8.5 8.9h7M8.5 11.5h4.4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      </span>
    )
  }

  if (variant === 'building') {
    return (
      <span className="feature-icon card-logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M6 20V6.2A1.2 1.2 0 0 1 7.2 5h9.6A1.2 1.2 0 0 1 18 6.2V20M4 20h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 8.5h1.5M13.5 8.5H15M9 12h1.5M13.5 12H15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      </span>
    )
  }

  if (variant === 'api') {
    return (
      <span className="feature-icon card-logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="m8.2 8.2-3.7 3.8 3.7 3.8M15.8 8.2l3.7 3.8-3.7 3.8M13.2 6l-2.4 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  }

  if (variant === 'shield') {
    return (
      <span className="feature-icon card-logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M12 3 20 6.5V12c0 5-3.4 7.9-8 9-4.6-1.1-8-4-8-9V6.5L12 3Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
          <path d="m9.3 12 1.8 1.8 3.6-3.6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  }

  if (variant === 'spark') {
    return (
      <span className="feature-icon card-logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M13 3 7.8 12h3.8L11 21l5.2-9h-3.8L13 3Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  }

  if (variant === 'globe') {
    return (
      <span className="feature-icon card-logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.75" />
          <path d="M3.8 12h16.4M12 3.5c2.5 2.5 3.8 5.4 3.8 8.5 0 3.1-1.3 6-3.8 8.5-2.5-2.5-3.8-5.4-3.8-8.5 0-3.1 1.3-6 3.8-8.5Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  }

  return (
    <span className="feature-icon card-logo" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M6 8h12M6 12h8M6 16h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M17 4h3v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

export default CardLogo
