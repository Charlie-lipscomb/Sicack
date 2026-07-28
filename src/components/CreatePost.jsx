import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { forums } from '../data/mockData'

export default function CreatePost({ onPostCreated, defaultForum = '' }) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [forum, setForum] = useState(defaultForum || forums[0].name)
  const [submitting, setSubmitting] = useState(false)

  if (!user) {
    return (
      <div className="create-post">
        <p>Please <a href="/login">log in</a> to create a post.</p>
      </div>
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return

    setSubmitting(true)

    // In a real app this would write to Firebase Realtime Database:
    // import { ref, push } from 'firebase/database'
    // import { database } from '../firebase'
    // push(ref(database, 'posts'), newPost)

    const newPost = {
      id: Date.now().toString(),
      title: title.trim(),
      body: body.trim(),
      forum: forum.toLowerCase(),
      author: user.username,
      createdAt: Date.now(),
      upvotes: 1,
      comments: 0,
    }

    onPostCreated(newPost)
    setTitle('')
    setBody('')
    setSubmitting(false)
  }

  return (
    <div className="create-post">
      <h2>Create a post</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="forum">Forum</label>
          <select
            id="forum"
            value={forum}
            onChange={(e) => setForum(e.target.value)}
          >
            {forums.map((f) => (
              <option key={f.id} value={f.name}>
                r/{f.name}
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
            placeholder="Title"
            required
            maxLength={300}
          />
        </div>
        <div className="form-group">
          <label htmlFor="body">Text (optional)</label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Text (optional)"
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  )
}
