import { Link } from 'react-router-dom'
import { publicDisplayName } from '../utils/admin'
import { timeAgo } from '../utils/time'

export default function PostCard({ post }) {
  const community = post.community || post.forum || 'general'
  const author = publicDisplayName(post.author)
  const authorSlug = encodeURIComponent(post.author || 'member')

  return (
    <article className="post-card">
      <div className="post-meta">
        <Link to={`/c/${community}`} className="forum-pill">
          {community}
        </Link>
        <span className="meta-sep" />
        <Link to={`/u/${authorSlug}`} className="author-link">
          {author}
        </Link>
        <span className="meta-sep" />
        <span>{timeAgo(post.createdAt)}</span>
      </div>
      <Link to={`/post/${post.id}`} className="post-title-link">
        <h2 className="post-title">{post.title}</h2>
      </Link>
      {post.imageUrl ? (
        <Link to={`/post/${post.id}`} className="post-image-link">
          <img src={post.imageUrl} alt="" className="post-image" loading="lazy" />
        </Link>
      ) : null}
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
