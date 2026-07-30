import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ref, onValue, update } from 'firebase/database'
import { database } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { useComments } from '../hooks/useComments'
import { publicDisplayName, isAdminUser } from '../utils/admin'
import { timeAgo } from '../utils/time'
import { useToast } from '../context/ToastContext'

export default function PostDetail() {
  const { postId } = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reply, setReply] = useState('')
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')
  const { comments, addComment, softDeleteComment } = useComments(postId)

  useEffect(() => {
    if (!postId) return
    const unsub = onValue(ref(database, `posts/${postId}`), (snap) => {
      if (!snap.exists() || snap.val()?.deleted) {
        setPost(null)
      } else {
        setPost({ id: postId, ...snap.val() })
      }
      setLoading(false)
    })
    return () => unsub()
  }, [postId])

  const isOwner = user && post && (user.uid === post.authorId || isAdminUser(user))

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
      toast('Reply posted', 'success')
    } catch (err) {
      toast(err.message || 'Could not post reply', 'error')
    } finally {
      setBusy(false)
    }
  }

  const startEdit = () => {
    setEditTitle(post.title || '')
    setEditBody(post.body || '')
    setEditing(true)
  }

  const saveEdit = async () => {
    if (!editTitle.trim()) return
    setBusy(true)
    try {
      await update(ref(database, `posts/${postId}`), {
        title: editTitle.trim(),
        body: editBody.trim(),
        updatedAt: Date.now(),
      })
      setEditing(false)
      toast('Post updated', 'success')
    } catch (err) {
      toast(err.message || 'Could not update', 'error')
    } finally {
      setBusy(false)
    }
  }

  const deletePost = async () => {
    if (!confirm('Remove this post?')) return
    setBusy(true)
    try {
      await update(ref(database, `posts/${postId}`), {
        deleted: true,
        deletedAt: Date.now(),
      })
      toast('Post removed', 'success')
      navigate('/')
    } catch (err) {
      toast(err.message || 'Could not remove', 'error')
    } finally {
      setBusy(false)
    }
  }

  const deleteComment = async (commentId) => {
    if (!confirm('Remove this reply?')) return
    try {
      await softDeleteComment(commentId)
      toast('Reply removed', 'success')
    } catch (err) {
      toast(err.message || 'Could not remove', 'error')
    }
  }

  if (loading) {
    return <div className="empty-state">Loading…</div>
  }

  if (!post) {
    return (
      <div className="empty-state">
        <h2>Post not found</h2>
        <p>It may have been removed.</p>
        <div className="empty-actions">
          <Link to="/" className="btn btn-primary btn-sm">
            Back to feed
          </Link>
        </div>
      </div>
    )
  }

  const community = post.community || post.forum || 'general'
  const authorSlug = encodeURIComponent(post.author || 'member')

  return (
    <div className="post-detail">
      <Link to="/" className="back-link">
        ← Feed
      </Link>

      <article className="post-detail-card">
        <div className="post-meta">
          <Link to={`/c/${community}`} className="forum-pill">
            {community}
          </Link>
          <span className="meta-sep" />
          <Link to={`/u/${authorSlug}`} className="author-link">
            {publicDisplayName(post.author)}
          </Link>
          <span className="meta-sep" />
          <span>{timeAgo(post.createdAt, { long: true })}</span>
          {post.updatedAt ? (
            <>
              <span className="meta-sep" />
              <span className="edited-tag">edited</span>
            </>
          ) : null}
        </div>

        {editing ? (
          <div className="edit-post-form">
            <div className="form-group">
              <label>Title</label>
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} maxLength={300} />
            </div>
            <div className="form-group">
              <label>Body</label>
              <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} rows={5} />
            </div>
            <div className="edit-actions">
              <button type="button" className="btn btn-primary btn-sm" onClick={saveEdit} disabled={busy}>
                Save
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="post-detail-title">{post.title}</h1>
            {post.imageUrl ? (
              <img src={post.imageUrl} alt="" className="post-detail-image" />
            ) : null}
            {post.body ? <p className="post-detail-body">{post.body}</p> : null}
          </>
        )}

        {isOwner && !editing ? (
          <div className="post-owner-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={startEdit}>
              Edit
            </button>
            <button type="button" className="btn btn-danger btn-sm" onClick={deletePost} disabled={busy}>
              Delete
            </button>
          </div>
        ) : null}
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
            comments.map((c) => {
              const canDelete =
                user && (user.uid === c.authorId || isAdminUser(user))
              return (
                <div key={c.id} className="reply-card">
                  <div className="reply-meta">
                    <Link
                      to={`/u/${encodeURIComponent(c.author || 'member')}`}
                      className="reply-author author-link"
                    >
                      {publicDisplayName(c.author)}
                    </Link>
                    <span className="meta-sep" />
                    <span>{timeAgo(c.createdAt, { long: true })}</span>
                    {canDelete ? (
                      <button
                        type="button"
                        className="reply-delete"
                        onClick={() => deleteComment(c.id)}
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                  <p className="reply-body">{c.body}</p>
                </div>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}
