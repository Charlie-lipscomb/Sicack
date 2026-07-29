import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import PostCard from '../components/PostCard'
import ForumList from '../components/ForumList'
import ConnectionStatus from '../components/ConnectionStatus'
import { usePosts } from '../hooks/usePosts'

export default function Search() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const { posts, status, error } = usePosts()

  const results = useMemo(() => {
    if (!query.trim()) return []
    const lower = query.toLowerCase()
    return posts.filter(
      (p) =>
        p.title?.toLowerCase().includes(lower) ||
        (p.body && p.body.toLowerCase().includes(lower)) ||
        (p.community || p.forum || '').toLowerCase().includes(lower) ||
        p.author?.toLowerCase().includes(lower)
    )
  }, [posts, query])

  return (
    <div className="content-layout">
      <div className="feed">
        <div className="page-hero animate-in">
          <h1>Search</h1>
          <p>{query ? `Results for “${query}”` : 'Type a query in the bar above'}</p>
        </div>
        <ConnectionStatus status={status} error={error} />
        <div className="post-list">
          {status === 'connecting' ? (
            <div className="empty-state animate-in">Searching…</div>
          ) : results.length === 0 ? (
            <div className="empty-state animate-in">
              {query ? 'Nothing matched that search.' : 'Enter a search term above.'}
            </div>
          ) : (
            results.map((post, i) => (
              <PostCard key={post.id} post={post} style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }} />
            ))
          )}
        </div>
      </div>
      <aside className="sidebar">
        <ForumList />
      </aside>
    </div>
  )
}
