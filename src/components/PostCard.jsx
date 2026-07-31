import { Link } from 'react-router-dom'
import { publicDisplayName } from '../utils/admin'
import { timeAgo } from '../utils/time'
import { truncate } from '../utils/format'

export default function PostCard({ post, commentCount = 0 }) {
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
        <time dateTime={post.createdAt ? new Date(post.createdAt).toISOString() : undefined}>
          {timeAgo(post.createdAt)}
        </time>
      </div>
      <Link to={`/post/${post.id}`} className="post-title-link">
        <h2 className="post-title">{post.title}</h2>
      </Link>
      {post.imageUrl ? (
        <Link to={`/post/${post.id}`} className="post-image-link">
          <img src={post.imageUrl} alt="" className="post-image" loading="lazy" />
        </Link>
      ) : null}
      {post.body ? <p className="post-body">{truncate(post.body, 200)}</p> : null}
      <div className="post-footer">
        <Link to={`/post/${post.id}`} className="post-reply-link">
          {commentCount === 0
            ? 'Reply'
            : `${commentCount} ${commentCount === 1 ? 'reply' : 'replies'}`}
        </Link>
      </div>
    </article>
  )
}
