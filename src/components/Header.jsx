import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { isAdminUser, publicDisplayName } from '../utils/admin'

export default function Header() {
  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
    }
  }

  const displayName = user ? publicDisplayName(user.username) : ''

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          <span className="logo-mark">◆</span>
          <span className="logo-text">Sicack</span>
        </Link>

        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="search"
            className="search-input"
            placeholder="Search posts…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        <div className="nav-links">
          {loading ? (
            <span className="user-info">…</span>
          ) : user ? (
            <>
              {isAdminUser(user) && (
                <Link to="/admin" className="btn btn-primary">
                  Admin
                </Link>
              )}
              <Link to="/messages" className="btn btn-ghost">
                Messages
              </Link>
              <span className="user-chip">
                <span className="user-avatar">{displayName.charAt(0).toUpperCase()}</span>
                {displayName}
              </span>
              <button type="button" className="btn btn-ghost" onClick={() => logout()}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Sign in
              </Link>
              <Link to="/login" className="btn btn-primary">
                Join
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
