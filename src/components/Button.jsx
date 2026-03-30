import { Link } from 'react-router-dom'

function Button({
  children,
  variant = 'primary',
  to,
  type = 'button',
  className = '',
  fullWidth = false,
  ...rest
}) {
  const classes = `btn btn-${variant} ${fullWidth ? 'btn-block' : ''} ${className}`.trim()

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  )
}

export default Button
