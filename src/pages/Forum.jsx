import { useParams } from 'react-router-dom'
import PostCard from '../components/PostCard'
import CreatePost from '../components/CreatePost'
import ForumList from '../components/ForumList'
import ConnectionStatus from '../components/ConnectionStatus'
import { usePosts } from '../hooks/usePosts'
import { forums } from '../data/mockData'

export default function Forum() {
  const { forumName } = useParams()
  const forum = forums.find((f) => f.name.toLowerCase() === forumName?.toLowerCase())
  const { posts, status, error, createPost } = usePosts(forumName)

  const handlePostCreated = async (newPost) => {
    try {
      await createPost(newPost)
    } catch (err) {
      alert('Could not save post. Check Firebase rules.\n\n' + err.message)
    }
  }

  if (!forum) {
    return (
      <div className="empty-state animate-in">
        <h2>Community not found</h2>
        <p>{forumName} doesn’t exist yet.</p>
      </div>
    )
  }

  return (
    <div className="content-layout">
      <div className="feed">
        <div className="forum-header animate-in">
          <span className="forum-badge">{forum.name}</span>
          <h1>{forum.name}</h1>
          <p>{forum.description}</p>
        </div>
        <ConnectionStatus status={status} error={error} />
        <CreatePost onPostCreated={handlePostCreated} defaultForum={forum.name} />
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
