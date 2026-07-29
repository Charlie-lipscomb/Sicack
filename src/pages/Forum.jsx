import { useParams } from 'react-router-dom'
import PostCard from '../components/PostCard'
import CreatePost from '../components/CreatePost'
import ForumList from '../components/ForumList'
import ConnectionStatus from '../components/ConnectionStatus'
import { usePosts } from '../hooks/usePosts'
import { forums } from '../data/mockData'

export default function Forum() {
  const { forumName } = useParams()
  const forum = forums.find(
    (f) => f.name.toLowerCase() === forumName?.toLowerCase()
  )
  const { posts, status, error, createPost } = usePosts(forumName)

  const handlePostCreated = async (newPost) => {
    try {
      await createPost(newPost)
    } catch (err) {
      alert('Could not save post to Firebase. Check your database rules.\n\n' + err.message)
    }
  }

  if (!forum) {
    return (
      <div className="empty-state">
        <h2>Forum not found</h2>
        <p>r/{forumName} does not exist.</p>
      </div>
    )
  }

  return (
    <div className="content-layout">
      <div>
        <div className="forum-header">
          <h1>r/{forum.name}</h1>
          <p>{forum.description}</p>
        </div>
        <ConnectionStatus status={status} error={error} />
        <CreatePost onPostCreated={handlePostCreated} defaultForum={forum.name} />
        <div className="post-list">
          {status === 'connecting' ? (
            <div className="empty-state">Connecting to Firebase…</div>
          ) : posts.length === 0 ? (
            <div className="empty-state">No posts in this forum yet.</div>
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
