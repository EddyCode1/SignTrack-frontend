import PropTypes from 'prop-types'

const AuthLayout = ({ children }) => {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="relative z-10 w-full max-w-xs sm:max-w-sm px-4 py-8">{children}</div>
    </div>
  )
}

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default AuthLayout
