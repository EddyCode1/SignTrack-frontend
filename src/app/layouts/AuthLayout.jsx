const AuthLayout = ({ children }) => {
  return (
    <div className="auth-shell">
      <div className="auth-shell__bg" aria-hidden="true">
        <div className="auth-shell__orb auth-shell__orb--1" />
        <div className="auth-shell__orb auth-shell__orb--2" />
        <div className="auth-shell__orb auth-shell__orb--3" />
      </div>

      <div className="auth-shell__panel">
        <div className="auth-shell__brand">
          <span className="auth-shell__logo">ST</span>
          <div>
            <p className="auth-shell__name">SignTrack</p>
            <p className="auth-shell__tagline">Comunicación inclusiva</p>
          </div>
        </div>

        <div className="auth-card page-enter">{children}</div>
      </div>
    </div>
  )
}

export default AuthLayout
