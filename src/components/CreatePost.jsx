import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { forums } from '../data/mockData'

export default function CreatePost({ onPostCreated, defaultForum = '' }) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [forum, setForum] = useState(defaultForum || forums[0].name)
  const [submitting, setSubmitting] = useState(false)
  const [open, setOpen] = useState(false)

  if (!user) {
    return (
      <div className="create-post create-locked animate-in">
        <p>
          <Link to="/login">Sign in</Link> to share something with the community.
        </p>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    try {
      await onPostCreated({
        title: title.trim(),
        body: body.trim(),
        forum: forum.toLowerCase(),
        author: user.username,
        createdAt: Date.now(),
        upvotes: 1,
        comments: 0,
      })
      setTitle('')
      setBody('')
      setOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) {
    return (
      <button type="button" className="create-trigger animate-in" onClick={() => setOpen(true)}>
        <span className="create-plus">+</span>
        Start a conversation…
      </button>
    )
  }

  return (
    <div className="create-post animate-in">
      <div className="create-head">
        <h2>New post</h2>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="forum">Community</label>
          <select id="forum" value={forum} onChange={(e) => setForum(e.target.value)}>
            {forums.map((f) => (
              <option key={f.id} value={f.name}>
                {f.name}
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
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Publishing…' : 'Publish'}
        </button>
      </form>
    </div>
  )
}
