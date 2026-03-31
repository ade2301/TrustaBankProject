import trustaLogo from '../assets/trusta-logo-final.png'

function AppSplash({ message = 'Preparing your dashboard...' }) {
  return (
    <div className="app-splash" role="status" aria-live="polite">
      <div className="app-splash-glow" />
      <div className="app-splash-content">
        <img src={trustaLogo} alt="Trusta Bank" className="app-splash-logo" />
        <h1 className="app-splash-title">Trusta Bank</h1>
        <p className="app-splash-message">{message}</p>

        <div className="app-splash-loader" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  )
}

export default AppSplash