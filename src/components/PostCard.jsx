import { Link } from 'react-router-dom'
import { publicDisplayName } from '../utils/admin'

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
  const community = post.community || post.forum || 'general'
  const author = publicDisplayName(post.author)

  return (
    <article className="post-card animate-in" style={style}>
      <div className="post-content">
        <div className="post-meta">
          <Link to={`/c/${community}`} className="forum-pill">
            {community}
          </Link>
          <span className="dot">·</span>
          <span>{author}</span>
          <span className="dot">·</span>
          <span>{timeAgo(post.createdAt)} ago</span>
        </div>
        <h2 className="post-title">{post.title}</h2>
        {post.body ? <p className="post-body">{post.body}</p> : null}
      </div>
    </article>
  )
}
