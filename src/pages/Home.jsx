import { useState } from 'react'
import { Link } from 'react-router-dom'
import PostCard from '../components/PostCard'
import CreatePost from '../components/CreatePost'
import ForumList from '../components/ForumList'
import ConnectionStatus from '../components/ConnectionStatus'
import { FeedSkeleton } from '../components/Skeleton'
import { usePosts } from '../hooks/usePosts'
import { useToast } from '../context/ToastContext'

export default function Home() {
  const [sort, setSort] = useState('new')
  const { posts, status, error, createPost } = usePosts(null, { sort })
  const { toast } = useToast()

  const handlePostCreated = async (newPost) => {
    await createPost(newPost)
  }

  return (
    <div className="content-layout">
      <div className="feed">
        <header className="page-hero page-hero-row">
          <div>
            <span className="eyebrow">Live feed</span>
            <h1>Home</h1>
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
        <ConnectionStatus status={status} error={error} />
        <CreatePost onPostCreated={handlePostCreated} />
        {status === 'connecting' ? (
          <FeedSkeleton />
        ) : posts.length === 0 ? (
          <div className="empty-state">
            {status === 'error' ? (
              <>
                <h2>Could not reach the database</h2>
                <p>Check your connection and Firebase rules.</p>
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
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
      <aside className="sidebar">
        <ForumList />
      </aside>
    </div>
  )
}
