import { Link } from 'react-router-dom'

/** Brand mark — uses public/logo.svg (champagne gold hex monogram) */
export default function Logo({ size = 32, showWordmark = true, to = '/', className = '' }) {
  const img = (
    <img
      src={`${import.meta.env.BASE_URL}logo.svg`}
      alt=""
      width={size}
      height={size}
      className="logo-img"
      draggable={false}
    />
  )

  if (!showWordmark) {
    return to ? (
      <Link to={to} className={`logo logo-icon-only ${className}`} aria-label="Sicack home">
        {img}
      </Link>
    ) : (
      <span className={`logo logo-icon-only ${className}`}>{img}</span>
    )
  }

  return (
    <Link to={to} className={`logo ${className}`}>
      {img}
      <span className="logo-text">Sicack</span>
    </Link>
  )
}
