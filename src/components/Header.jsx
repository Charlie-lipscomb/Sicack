import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isAdminUser, publicDisplayName } from '../utils/admin'
import { useUnreadCount } from '../hooks/useUnread'
import Logo from './Logo'

export default function Header() {
  const { user, logout, loading } = useAuth()
  const unread = useUnreadCount(user?.uid)
  const displayName = user ? publicDisplayName(user.username) : ''
  const [menuOpen, setMenuOpen] = useState(false)

  const close = () => setMenuOpen(false)

  return (
    <header className="header">
      <div className="header-inner">
        <Logo size={34} />

        <button
          type="button"
          className="nav-toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav-links ${menuOpen ? 'nav-open' : ''}`}>
          {loading ? (
            <span className="nav-muted">Loading…</span>
          ) : user ? (
            <>
              {isAdminUser(user) && (
                <Link to="/admin" className="btn btn-secondary btn-sm" onClick={close}>
                  Admin
                </Link>
              )}
              <Link to="/messages" className="btn btn-secondary btn-sm nav-messages" onClick={close}>
                Messages
                {unread > 0 && (
                  <span className="notif-badge" aria-label={`${unread} unread`}>
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </Link>
              <Link
                to={`/u/${encodeURIComponent(user.username)}`}
                className="user-chip user-chip-link"
                onClick={close}
              >
                <span className="user-avatar">{displayName.charAt(0).toUpperCase()}</span>
                <span className="user-name">{displayName}</span>
              </Link>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  close()
                  logout()
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm" onClick={close}>
                Sign in
              </Link>
              <Link to="/login" className="btn btn-primary btn-sm" onClick={close}>
                Join
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
