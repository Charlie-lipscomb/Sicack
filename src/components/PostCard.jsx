import { Link } from 'react-router-dom'

function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

export default function PostCard({ post, style }) {
  return (
    <article className="post-card animate-in" style={style}>
      <div className="post-score">
        <button type="button" className="vote-btn" aria-label="Upvote">
          ⌃
        </button>
        <span>{post.upvotes ?? 0}</span>
        <button type="button" className="vote-btn" aria-label="Downvote">
          ⌄
        </button>
      </div>
      <div className="post-content">
        <div className="post-meta">
          <Link to={`/r/${post.forum}`} className="forum-pill">
            {post.forum}
          </Link>
          <span className="dot">·</span>
          <span>{post.author}</span>
          <span className="dot">·</span>
          <span>{timeAgo(post.createdAt)} ago</span>
        </div>
        <h2 className="post-title">{post.title}</h2>
        {post.body ? <p className="post-body">{post.body}</p> : null}
        <div className="post-actions">
          <span>{post.comments ?? 0} replies</span>
        </div>
      </div>
    </article>
  )
}
