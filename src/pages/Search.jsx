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
        p.forum?.toLowerCase().includes(lower) ||
        p.author?.toLowerCase().includes(lower)
    )
  }, [posts, query])

  return (
    <div className="content-layout">
      <div>
        <h1 className="page-title">Search results for &quot;{query}&quot;</h1>
        <ConnectionStatus status={status} error={error} />
        <div className="post-list">
          {status === 'connecting' ? (
            <div className="empty-state">Searching…</div>
          ) : results.length === 0 ? (
            <div className="empty-state">
              {query ? 'No posts matched your search.' : 'Enter a search term above.'}
            </div>
          ) : (
            results.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </div>
      <aside className="sidebar">
        <ForumList />
      </aside>
    </div>
  )
}
