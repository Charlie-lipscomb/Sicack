import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="empty-state">
      <h2>Page not found</h2>
      <p>That link doesn’t lead anywhere on Sicack.</p>
      <div className="empty-actions">
        <Link to="/" className="btn btn-primary btn-sm">
          Go home
        </Link>
      </div>
    </div>
  )
}
