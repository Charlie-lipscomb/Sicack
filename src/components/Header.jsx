import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isAdminUser, publicDisplayName } from '../utils/admin'
import { useUnreadCount } from '../hooks/useUnread'

export default function Header() {
  const { user, logout, loading } = useAuth()
  const unread = useUnreadCount(user?.uid)
  const displayName = user ? publicDisplayName(user.username) : ''

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          <span className="logo-mark" aria-hidden="true">S</span>
          <span className="logo-text">Sicack</span>
        </Link>

        <nav className="nav-links">
          {loading ? (
            <span className="nav-muted">Loading…</span>
          ) : user ? (
            <>
              {isAdminUser(user) && (
                <Link to="/admin" className="btn btn-secondary btn-sm">
                  Admin
                </Link>
              )}
              <Link to="/messages" className="btn btn-secondary btn-sm nav-messages">
                Messages
                {unread > 0 && (
                  <span className="notif-badge" aria-label={`${unread} unread`}>
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </Link>
              <span className="user-chip">
                <span className="user-avatar">{displayName.charAt(0).toUpperCase()}</span>
                <span className="user-name">{displayName}</span>
              </span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => logout()}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Sign in
              </Link>
              <Link to="/login" className="btn btn-primary btn-sm">
                Join
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
