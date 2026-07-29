import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ref, onValue } from 'firebase/database'
import { database } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { useComments } from '../hooks/useComments'
import { publicDisplayName } from '../utils/admin'

function timeAgo(timestamp) {
  if (!timestamp) return ''
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return new Date(timestamp).toLocaleString()
}

export default function PostDetail() {
  const { postId } = useParams()
  const { user } = useAuth()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reply, setReply] = useState('')
  const [busy, setBusy] = useState(false)
  const { comments, addComment } = useComments(postId)

  useEffect(() => {
    if (!postId) return
    const unsub = onValue(ref(database, `posts/${postId}`), (snap) => {
      setPost(snap.exists() ? { id: postId, ...snap.val() } : null)
      setLoading(false)
    })
    return () => unsub()
  }, [postId])

  const handleReply = async (e) => {
    e.preventDefault()
    if (!user || !reply.trim()) return
    setBusy(true)
    try {
      await addComment({
        body: reply,
        author: user.username,
        authorId: user.uid,
      })
      setReply('')
    } catch (err) {
      alert('Could not post reply: ' + err.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <div className="empty-state">Loading…</div>
  }

  if (!post) {
    return (
      <div className="empty-state">
        <h2>Post not found</h2>
        <p><Link to="/">Back to feed</Link></p>
      </div>
    )
  }

  const community = post.community || post.forum || 'general'

  return (
    <div className="post-detail">
      <Link to="/" className="back-link">← Feed</Link>

      <article className="post-detail-card">
        <div className="post-meta">
          <Link to={`/c/${community}`} className="forum-pill">{community}</Link>
          <span className="meta-sep" />
          <span>{publicDisplayName(post.author)}</span>
          <span className="meta-sep" />
          <span>{timeAgo(post.createdAt)}</span>
        </div>
        <h1 className="post-detail-title">{post.title}</h1>
        {post.body ? <p className="post-detail-body">{post.body}</p> : null}
      </article>

      <section className="replies-section">
        <h2 className="replies-heading">
          {comments.length === 0
            ? 'Replies'
            : `${comments.length} ${comments.length === 1 ? 'reply' : 'replies'}`}
        </h2>

        {user ? (
          <form className="reply-form" onSubmit={handleReply}>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Write a reply…"
              rows={3}
              maxLength={2000}
            />
            <button type="submit" className="btn btn-primary" disabled={busy || !reply.trim()}>
              {busy ? 'Posting…' : 'Reply'}
            </button>
          </form>
        ) : (
          <p className="reply-locked">
            <Link to="/login">Sign in</Link> to reply
          </p>
        )}

        <div className="replies-list">
          {comments.length === 0 ? (
            <p className="replies-empty">No replies yet — start the conversation.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="reply-card">
                <div className="reply-meta">
                  <span className="reply-author">{publicDisplayName(c.author)}</span>
                  <span className="meta-sep" />
                  <span>{timeAgo(c.createdAt)}</span>
                </div>
                <p className="reply-body">{c.body}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
