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
      alert('Could not save post to Firebase. Check your database rules.\n\n' + err.message)
    }
  }

  return (
    <div className="content-layout">
      <div>
        <ConnectionStatus status={status} error={error} />
        <CreatePost onPostCreated={handlePostCreated} />
        <div className="post-list">
          {status === 'connecting' ? (
            <div className="empty-state">Connecting to Firebase…</div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              {status === 'error'
                ? 'Could not load posts from Firebase. Open the sidebar tip and check your rules.'
                : 'No posts yet. Log in and be the first to post!'}
            </div>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </div>
      <aside className="sidebar">
        <ForumList />
        <div className="sidebar-card">
          <h3>Backend</h3>
          <p style={{ fontSize: '0.85rem', color: '#7c7c7c' }}>
            All posts are stored in Firebase Realtime Database and sync live for everyone on the site.
          </p>
        </div>
      </aside>
    </div>
  )
}
