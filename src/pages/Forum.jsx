import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import PostCard from '../components/PostCard'
import CreatePost from '../components/CreatePost'
import ForumList from '../components/ForumList'
import { initialPosts, forums } from '../data/mockData'

export default function Forum() {
  const { forumName } = useParams()
  const [posts, setPosts] = useState([])

  const forum = forums.find(
    (f) => f.name.toLowerCase() === forumName?.toLowerCase()
  )

  useEffect(() => {
    const saved = localStorage.getItem('reddit_clone_posts')
    let allPosts = initialPosts
    if (saved) {
      try {
        allPosts = JSON.parse(saved)
      } catch {
        /* keep initial */
      }
    }
    const filtered = allPosts.filter(
      (p) => p.forum.toLowerCase() === forumName?.toLowerCase()
    )
    setPosts(filtered.sort((a, b) => b.createdAt - a.createdAt))
  }, [forumName])

  const handlePostCreated = (newPost) => {
    const saved = localStorage.getItem('reddit_clone_posts')
    let allPosts = initialPosts
    if (saved) {
      try {
        allPosts = JSON.parse(saved)
      } catch {
        /* keep initial */
      }
    }
    const updated = [newPost, ...allPosts]
    localStorage.setItem('reddit_clone_posts', JSON.stringify(updated))
    if (newPost.forum.toLowerCase() === forumName?.toLowerCase()) {
      setPosts((prev) => [newPost, ...prev])
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
        <CreatePost onPostCreated={handlePostCreated} defaultForum={forum.name} />
        <div className="post-list">
          {posts.length === 0 ? (
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
