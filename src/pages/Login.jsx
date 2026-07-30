import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth, BannedError } from '../context/AuthContext'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { login, signup, user, banNotice, clearBanNotice } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

  useEffect(() => {
    if (banNotice) {
      setError(banNotice)
      clearBanNotice()
    }
  }, [banNotice, clearBanNotice])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'signup') {
        if (!username.trim()) throw new Error('Choose a display name')
        if (password.length < 6) throw new Error('Password must be at least 6 characters')
        await signup(email.trim(), password, username.trim())
      } else {
        await login(email.trim(), password)
      }
      navigate('/')
    } catch (err) {
      if (err instanceof BannedError || err.code === 'sicack/banned') {
        setError(err.message)
      } else {
        const msg =
          err.code === 'auth/email-already-in-use'
            ? 'That email is already registered. Try logging in.'
            : err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
              ? 'Wrong email or password.'
              : err.code === 'auth/user-not-found'
                ? 'No account with that email. Create one instead.'
                : err.code === 'auth/weak-password'
                  ? 'Password must be at least 6 characters.'
                  : err.code === 'auth/invalid-email'
                    ? 'Enter a valid email address.'
                    : err.code === 'auth/operation-not-allowed'
                      ? 'Email/password sign-in is disabled in Firebase Console.'
                      : err.message || 'Something went wrong.'
        setError(msg)
      }
    } finally {
      setBusy(false)
    }
  }

  if (user) return null

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt=""
            className="auth-logo-img"
            width={56}
            height={56}
            draggable={false}
          />
          <h1>Sicack</h1>
          <p>Communities that move with you</p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => { setMode('login'); setError('') }}
          >
            Sign in
          </button>
          <button
            type="button"
            className={mode === 'signup' ? 'active' : ''}
            onClick={() => { setMode('signup'); setError('') }}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <div className="form-group">
              <label htmlFor="username">Display name</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="How others see you"
                required
                maxLength={24}
                autoComplete="nickname"
              />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
              required
              minLength={6}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/">← Back to feed</Link>
        </p>
      </div>
    </div>
  )
}
