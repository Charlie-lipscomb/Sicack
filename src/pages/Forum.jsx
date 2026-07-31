import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import PostCard from '../components/PostCard'
import CreatePost from '../components/CreatePost'
import ForumList from '../components/ForumList'
import ConnectionStatus from '../components/ConnectionStatus'
import { FeedSkeleton } from '../components/Skeleton'
import { usePosts } from '../hooks/usePosts'
import { useCommunities } from '../hooks/useCommunities'
import { useCommentCounts } from '../hooks/useCommentCounts'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function Forum() {
  const { forumName } = useParams()
  const [sort, setSort] = useState('new')
  const { communities } = useCommunities()
  const community = communities.find(
    (c) => c.name.toLowerCase() === forumName?.toLowerCase()
  )
  const { posts, status, error, createPost } = usePosts(forumName, { sort })
  const counts = useCommentCounts()

  const title = community?.name || forumName
  const description = community?.description || 'Community on Sicack'
  useDocumentTitle(title)

  const memberLabel = useMemo(() => {
    const authors = new Set(posts.map((p) => p.authorId || p.author).filter(Boolean))
    return authors.size
  }, [posts])

  return (
    <div className="content-layout">
      <div className="feed">
        <div className="forum-header">
          <div className="forum-header-top">
            <div>
              <span className="forum-badge">Community</span>
              <h1>{title}</h1>
              <p>{description}</p>
              <p className="forum-stats">
                {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                {memberLabel > 0 ? ` · ${memberLabel} contributors` : ''}
              </p>
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
        <CreatePost onPostCreated={createPost} defaultCommunity={forumName} />
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
              <PostCard key={post.id} post={post} commentCount={counts[post.id] || 0} />
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
