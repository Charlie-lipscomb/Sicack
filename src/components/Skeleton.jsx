export function PostSkeleton() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-line skeleton-sm" style={{ width: '40%' }} />
      <div className="skeleton-line skeleton-lg" style={{ width: '75%' }} />
      <div className="skeleton-line" style={{ width: '90%' }} />
      <div className="skeleton-line" style={{ width: '60%' }} />
    </div>
  )
}

export function FeedSkeleton({ count = 3 }) {
  return (
    <div className="post-list">
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  )
}
