import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import PostCard from '../components/PostCard'
import CreatePost from '../components/CreatePost'
import ForumList from '../components/ForumList'
import ConnectionStatus from '../components/ConnectionStatus'
import { FeedSkeleton } from '../components/Skeleton'
import { usePosts } from '../hooks/usePosts'
import { useCommunities } from '../hooks/useCommunities'

export default function Forum() {
  const { forumName } = useParams()
  const [sort, setSort] = useState('new')
  const { communities } = useCommunities()
  const community = communities.find(
    (c) => c.name.toLowerCase() === forumName?.toLowerCase()
  )
  const { posts, status, error, createPost } = usePosts(forumName, { sort })

  const handlePostCreated = async (newPost) => {
    await createPost(newPost)
  }

  const title = community?.name || forumName
  const description = community?.description || 'Community on Sicack'

  return (
    <div className="content-layout">
      <div className="feed">
        <div className="forum-header">
          <div className="forum-header-top">
            <div>
              <span className="forum-badge">Community</span>
              <h1>{title}</h1>
              <p>{description}</p>
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
          </div>
        </div>
        <ConnectionStatus status={status} error={error} />
        <CreatePost onPostCreated={handlePostCreated} defaultCommunity={forumName} />
        {status === 'connecting' ? (
          <FeedSkeleton />
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <h2>No posts here yet</h2>
            <p>Start the first conversation in this community.</p>
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
