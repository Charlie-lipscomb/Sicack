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
      alert('Could not save post.\n\n' + err.message)
    }
  }

  return (
    <div className="content-layout">
      <div className="feed">
        <header className="page-hero">
          <span className="eyebrow">Live feed</span>
          <h1>Home</h1>
        </header>
        <ConnectionStatus status={status} error={error} />
        <CreatePost onPostCreated={handlePostCreated} />
        <div className="post-list">
          {status === 'connecting' ? (
            <div className="empty-state">Connecting…</div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              {status === 'error'
                ? 'Could not reach the database.'
                : 'No posts yet. Start a conversation.'}
            </div>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </div>
      <aside className="sidebar">
        <ForumList />
      </aside>
    </div>
  )
}
