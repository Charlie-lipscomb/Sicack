import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <header className="header">
      <Link to="/" className="logo">
        reddit clone
      </Link>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          className="search-input"
          placeholder="Search posts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      <div className="nav-links">
        {user ? (
          <>
            <span className="user-info">u/{user.username}</span>
            <button className="btn btn-outline" onClick={logout}>
              Log Out
            </button>
          </>
        ) : (
          <Link to="/login">
            <button className="btn btn-primary">Log In</button>
          </Link>
        )}
      </div>
    </header>
  )
}
