import { Link, useNavigate } from 'react-router-dom'
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
          <span className="logo-mark" aria-hidden="true" />
          <span className="logo-text">Sicack</span>
        </Link>

        <nav className="nav-links">
          {loading ? (
            <span className="nav-muted">…</span>
          ) : user ? (
            <>
              {isAdminUser(user) && (
                <Link to="/admin" className="nav-link nav-admin">
                  Admin
                </Link>
              )}
              <Link to="/messages" className="nav-link nav-messages">
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
              <button type="button" className="nav-link nav-btn" onClick={() => logout()}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
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
