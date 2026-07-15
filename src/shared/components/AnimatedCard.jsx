import { Link } from 'react-router-dom'

const AnimatedCard = ({
  to,
  title,
  description,
  icon: Icon,
  accent = 'brand',
  index = 0,
  onClick,
  children,
  className = '',
}) => {
  const style = { animationDelay: `${index * 60}ms` }
  const accentClass = `animated-card--accent-${accent}`

  const inner = (
    <>
      {Icon && (
        <div className={`animated-card__icon ${accentClass}`}>
          <Icon size={22} aria-hidden="true" />
        </div>
      )}
      <div>
        <h3 className="animated-card__title">{title}</h3>
        {description && <p className="animated-card__desc">{description}</p>}
        {children}
      </div>
    </>
  )

  const classes = `animated-card animate-stagger-in ${accentClass} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes} style={style}>
        {inner}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={`${classes} text-left w-full`} style={style}>
      {inner}
    </button>
  )
}

export default AnimatedCard
