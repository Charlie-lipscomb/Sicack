import { Link } from 'react-router-dom'

function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function PostCard({ post }) {
  return (
    <article className="post-card">
      <div className="post-votes">
        <button className="vote-btn" aria-label="Upvote">▲</button>
        <span>{post.upvotes}</span>
        <button className="vote-btn" aria-label="Downvote">▼</button>
      </div>
      <div className="post-content">
        <div className="post-meta">
          <Link to={`/r/${post.forum}`} className="forum-link">
            r/{post.forum}
          </Link>
          {' • Posted by u/'}
          {post.author}
          {' • '}
          {timeAgo(post.createdAt)}
        </div>
        <h2 className="post-title">{post.title}</h2>
        {post.body && <p className="post-body">{post.body}</p>}
        <div className="post-actions">
          <span>{post.comments} comments</span>
          <span>Share</span>
          <span>Save</span>
        </div>
      </div>
    </article>
  )
}
