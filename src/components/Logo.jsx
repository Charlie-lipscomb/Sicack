import { Link } from 'react-router-dom'
import { logoUrl } from '../utils/brand'

export default function Logo({ size = 36, showWordmark = true, to = '/', className = '' }) {
  const img = (
    <img
      src={logoUrl()}
      alt=""
      width={size}
      height={size}
      className="logo-img"
      draggable={false}
      decoding="async"
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
    <Link to={to} className={`logo ${className}`} aria-label="Sicack home">
      {img}
      <span className="logo-text">Sicack</span>
    </Link>
  )
}
