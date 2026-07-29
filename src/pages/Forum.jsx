import { useParams } from 'react-router-dom'
import PostCard from '../components/PostCard'
import CreatePost from '../components/CreatePost'
import ForumList from '../components/ForumList'
import ConnectionStatus from '../components/ConnectionStatus'
import { usePosts } from '../hooks/usePosts'
import { useCommunities } from '../hooks/useCommunities'

export default function Forum() {
  const { forumName } = useParams()
  const { communities } = useCommunities()
  const community = communities.find(
    (c) => c.name.toLowerCase() === forumName?.toLowerCase()
  )
  const { posts, status, error, createPost } = usePosts(forumName)

  const handlePostCreated = async (newPost) => {
    try {
      await createPost(newPost)
    } catch (err) {
      alert('Could not save post.\n\n' + err.message)
    }
  }

  const title = community?.name || forumName
  const description = community?.description || 'Community on Sicack'

  return (
    <div className="content-layout">
      <div className="feed">
        <div className="forum-header animate-in">
          <span className="forum-badge">Community</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <ConnectionStatus status={status} error={error} />
        <CreatePost onPostCreated={handlePostCreated} defaultCommunity={forumName} />
        <div className="post-list">
          {status === 'connecting' ? (
            <div className="empty-state animate-in">Loading…</div>
          ) : posts.length === 0 ? (
            <div className="empty-state animate-in">No posts here yet.</div>
          ) : (
            posts.map((post, i) => (
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
