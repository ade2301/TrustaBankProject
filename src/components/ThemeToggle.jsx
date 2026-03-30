function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        {isDark ? '☀' : '🌙'}
      </span>
      <span className="theme-toggle-text">{isDark ? 'Light mode' : 'Dark mode'}</span>
    </button>
  )
}

export default ThemeToggle
