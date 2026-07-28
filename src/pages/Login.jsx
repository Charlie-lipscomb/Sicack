import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const { login, user } = useAuth()
  const navigate = useNavigate()

  if (user) {
    navigate('/')
    return null
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (username.trim()) {
      login(username.trim())
      navigate('/')
    }
  }

  return (
    <div className="login-container">
      <h1>Log In</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter a username"
            required
            autoFocus
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          Log In
        </button>
      </form>
      <p className="login-note">
        This is a demo login (no password). Your session is stored locally.
        Connect Firebase Auth later for real authentication.
      </p>
    </div>
  )
}
