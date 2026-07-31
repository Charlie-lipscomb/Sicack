import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PostCard from '../components/PostCard'
import CreatePost from '../components/CreatePost'
import ForumList from '../components/ForumList'
import ConnectionStatus from '../components/ConnectionStatus'
import { FeedSkeleton } from '../components/Skeleton'
import { usePosts } from '../hooks/usePosts'
import { useCommentCounts } from '../hooks/useCommentCounts'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function Home() {
  useDocumentTitle('Home')
  const [sort, setSort] = useState('new')
  const [filter, setFilter] = useState('')
  const { posts, status, error, createPost } = usePosts(null, { sort })
  const counts = useCommentCounts()

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return posts
    return posts.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.body?.toLowerCase().includes(q) ||
        p.author?.toLowerCase().includes(q) ||
        (p.community || p.forum || '').toLowerCase().includes(q)
    )
  }, [posts, filter])

  return (
    <div className="content-layout">
      <div className="feed">
        <header className="page-hero page-hero-row">
          <div>
            <span className="eyebrow">Live feed</span>
            <h1>Home</h1>
            <p className="page-sub">What the network is talking about</p>
          </div>
          <div className="sort-tabs segmented">
            <button
              type="button"
              className={sort === 'new' ? 'active' : ''}
              onClick={() => setSort('new')}
            >
              Newest
            </button>
            <button
              type="button"
              className={sort === 'active' ? 'active' : ''}
              onClick={() => setSort('active')}
            >
              Active
            </button>
          </div>
        </header>

        <div className="feed-filter">
          <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter this feed…"
            aria-label="Filter posts"
          />
          {filter ? (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setFilter('')}>
              Clear
            </button>
          ) : null}
        </div>

        <ConnectionStatus status={status} error={error} />
        <CreatePost onPostCreated={createPost} />

        {status === 'connecting' ? (
          <FeedSkeleton />
        ) : visible.length === 0 ? (
          <div className="empty-state">
            {status === 'error' ? (
              <>
                <h2>Could not reach the database</h2>
                <p>Check your connection and Firebase rules.</p>
              </>
            ) : filter ? (
              <>
                <h2>No matches</h2>
                <p>Nothing in the feed matches “{filter}”.</p>
              </>
            ) : (
              <>
                <h2>No posts yet</h2>
                <p>Be the first to start a conversation, or create a community.</p>
                <div className="empty-actions">
                  <Link to="/communities/new" className="btn btn-primary btn-sm">
                    New community
                  </Link>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="post-list">
            {visible.map((post) => (
              <PostCard key={post.id} post={post} commentCount={counts[post.id] || 0} />
            ))}
          </div>
        )}
      </div>
      <aside className="sidebar">
        <ForumList />
        <div className="sidebar-card sidebar-about">
          <h3>About</h3>
          <p className="sidebar-text">
            Sicack is a place for focused communities — post, reply, and message without the noise.
          </p>
        </div>
      </aside>
    </div>
  )
}
