import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ref, onValue, push } from 'firebase/database'
import { database } from '../firebase'
import PostCard from '../components/PostCard'
import CreatePost from '../components/CreatePost'
import ForumList from '../components/ForumList'
import { forums } from '../data/mockData'

export default function Forum() {
  const { forumName } = useParams()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const forum = forums.find(
    (f) => f.name.toLowerCase() === forumName?.toLowerCase()
  )

  useEffect(() => {
    const postsRef = ref(database, 'posts')
    const unsubscribe = onValue(
      postsRef,
      (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const postList = Object.entries(data)
            .map(([id, post]) => ({ id, ...post }))
            .filter(
              (p) => p.forum?.toLowerCase() === forumName?.toLowerCase()
            )
            .sort((a, b) => b.createdAt - a.createdAt)
          setPosts(postList)
        } else {
          setPosts([])
        }
        setLoading(false)
      },
      (error) => {
        console.error('Firebase read error:', error)
        setPosts([])
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [forumName])

  const handlePostCreated = (newPost) => {
    const postsRef = ref(database, 'posts')
    push(postsRef, {
      title: newPost.title,
      body: newPost.body,
      forum: newPost.forum,
      author: newPost.author,
      createdAt: newPost.createdAt,
      upvotes: newPost.upvotes,
      comments: newPost.comments,
    }).catch((err) => console.error('Firebase write error:', err))
  }

  if (!forum) {
    return (
      <div className="empty-state">
        <h2>Forum not found</h2>
        <p>r/{forumName} does not exist.</p>
      </div>
    )
  }

  if (loading) {
    return <div className="empty-state">Loading posts...</div>
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
