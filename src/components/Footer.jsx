import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <span className="footer-brand">Sicack</span>
        <nav className="footer-links">
          <Link to="/">Feed</Link>
          <Link to="/communities/new">Communities</Link>
          <Link to="/messages">Messages</Link>
        </nav>
        <span className="footer-meta">Built for real conversation</span>
      </div>
    </footer>
  )
}
