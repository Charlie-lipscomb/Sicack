import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCommunities } from '../hooks/useCommunities'
import { useToast } from '../context/ToastContext'

export default function CreatePost({ onPostCreated, defaultCommunity = '' }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const { communities } = useCommunities()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [community, setCommunity] = useState(defaultCommunity)
  const [submitting, setSubmitting] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (defaultCommunity) setCommunity(defaultCommunity)
    else if (communities.length && !community) setCommunity(communities[0].name)
  }, [defaultCommunity, communities])

  if (!user) {
    return (
      <div className="create-post create-locked">
        <p>
          <Link to="/login">Sign in</Link> to share something with the community.
        </p>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !community) return
    setSubmitting(true)
    try {
      await onPostCreated({
        title: title.trim(),
        body: body.trim(),
        imageUrl: imageUrl.trim(),
        community: community.toLowerCase(),
        author: user.username,
        authorId: user.uid,
        createdAt: Date.now(),
      })
      setTitle('')
      setBody('')
      setImageUrl('')
      setOpen(false)
      toast('Post published', 'success')
    } catch (err) {
      toast(err.message || 'Could not publish', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) {
    return (
      <button type="button" className="create-trigger" onClick={() => setOpen(true)}>
        <span className="create-plus">+</span>
        Start a conversation…
      </button>
    )
  }

  return (
    <div className="create-post">
      <div className="create-head">
        <h2>New post</h2>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="community">Community</label>
          <select
            id="community"
            value={community}
            onChange={(e) => setCommunity(e.target.value)}
            required
          >
            {communities.length === 0 && <option value="">No communities yet</option>}
            {communities.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What’s on your mind?"
            required
            maxLength={300}
            autoFocus
          />
        </div>
        <div className="form-group">
          <label htmlFor="body">Details (optional)</label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add more context…"
            rows={4}
          />
        </div>
        <div className="form-group">
          <label htmlFor="imageUrl">Image URL (optional)</label>
          <input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://…"
          />
          <span className="field-hint">Paste a direct link to an image</span>
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting || !community}>
          {submitting ? 'Publishing…' : 'Publish'}
        </button>
      </form>
    </div>
  )
}
