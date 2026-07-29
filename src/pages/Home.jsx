import PostCard from '../components/PostCard'
import CreatePost from '../components/CreatePost'
import ForumList from '../components/ForumList'
import ConnectionStatus from '../components/ConnectionStatus'
import { usePosts } from '../hooks/usePosts'

export default function Home() {
  const { posts, status, error, createPost } = usePosts()

  const handlePostCreated = async (newPost) => {
    try {
      await createPost(newPost)
    } catch (err) {
      alert('Could not save post. Check Firebase rules.\n\n' + err.message)
    }
  }

  return (
    <div className="content-layout">
      <div className="feed">
        <div className="page-hero animate-in">
          <h1>Discover</h1>
          <p>Fresh conversations across every community</p>
        </div>
        <ConnectionStatus status={status} error={error} />
        <CreatePost onPostCreated={handlePostCreated} />
        <div className="post-list">
          {status === 'connecting' ? (
            <div className="empty-state animate-in">Connecting to the network…</div>
          ) : posts.length === 0 ? (
            <div className="empty-state animate-in">
              {status === 'error'
                ? 'Could not reach Firebase. Check your database rules.'
                : 'No posts yet — be the first to publish.'}
            </div>
          ) : (
            posts.map((post, i) => (
              <PostCard key={post.id} post={post} style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }} />
            ))
          )}
        </div>
      </div>
      <aside className="sidebar">
        <ForumList />
        <div className="sidebar-card animate-in" style={{ animationDelay: '100ms' }}>
          <h3>About Sicack</h3>
          <p className="sidebar-text">
            A live social space powered by Firebase. Posts sync instantly for everyone on the site.
          </p>
        </div>
      </aside>
    </div>
  )
}
