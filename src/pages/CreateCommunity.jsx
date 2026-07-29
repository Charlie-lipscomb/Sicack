import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCommunities } from '../hooks/useCommunities'

export default function CreateCommunity() {
  const { user } = useAuth()
  const { createCommunity } = useCommunities()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!user) {
    return (
      <div className="empty-state animate-in">
        <h2>Sign in required</h2>
        <p>
          <Link to="/login">Sign in</Link> to create a community.
        </p>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const slug = await createCommunity({
        name,
        description,
        createdBy: user.username,
        createdById: user.uid,
      })
      navigate(`/c/${slug}`)
    } catch (err) {
      setError(err.message || 'Could not create community')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card animate-in" style={{ maxWidth: 480 }}>
        <div className="auth-brand">
          <span className="auth-logo">◆</span>
          <h1>New community</h1>
          <p>Start a space for people who share your interests</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. photography"
              required
              maxLength={32}
              pattern="[A-Za-z0-9‐‑_-]+"
              title="Letters, numbers, hyphens, underscores"
            />
            <span className="field-hint">Lowercase letters, numbers, - and _ only</span>
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this community about?"
              rows={3}
              maxLength={200}
            />
          </div>

          {error && <div className="auth-error animate-in">{error}</div>}

          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Creating…' : 'Create community'}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/">← Back to feed</Link>
        </p>
      </div>
    </div>
  )
}
