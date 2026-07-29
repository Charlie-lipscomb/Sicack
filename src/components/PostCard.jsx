import { Link } from 'react-router-dom'
import { publicDisplayName } from '../utils/admin'

function timeAgo(timestamp) {
  if (!timestamp) return ''
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return new Date(timestamp).toLocaleDateString()
}

export default function PostCard({ post }) {
  const community = post.community || post.forum || 'general'
  const author = publicDisplayName(post.author)

  return (
    <article className="post-card">
      <div className="post-meta">
        <Link to={`/c/${community}`} className="forum-pill">
          {community}
        </Link>
        <span className="meta-sep" />
        <span>{author}</span>
        <span className="meta-sep" />
        <span>{timeAgo(post.createdAt)}</span>
      </div>
      <Link to={`/post/${post.id}`} className="post-title-link">
        <h2 className="post-title">{post.title}</h2>
      </Link>
      {post.body ? (
        <p className="post-body">
          {post.body.length > 220 ? post.body.slice(0, 220) + '…' : post.body}
        </p>
      ) : null}
      <div className="post-footer">
        <Link to={`/post/${post.id}`} className="post-reply-link">
          Reply
        </Link>
      </div>
    </article>
  )
}
