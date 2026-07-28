import { useState, useEffect } from 'react'
import { ref, onValue, push } from 'firebase/database'
import { database } from '../firebase'
import PostCard from '../components/PostCard'
import CreatePost from '../components/CreatePost'
import ForumList from '../components/ForumList'
import { initialPosts } from '../data/mockData'

export default function Home() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const postsRef = ref(database, 'posts')
    const unsubscribe = onValue(
      postsRef,
      (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const postList = Object.entries(data).map(([id, post]) => ({
            id,
            ...post,
          }))
          setPosts(postList.sort((a, b) => b.createdAt - a.createdAt))
        } else {
          // Seed initial posts once if database is empty
          initialPosts.forEach((post) => {
            push(postsRef, {
              title: post.title,
              body: post.body,
              forum: post.forum,
              author: post.author,
              createdAt: post.createdAt,
              upvotes: post.upvotes,
              comments: post.comments,
            })
          })
        }
        setLoading(false)
      },
      (error) => {
        console.error('Firebase read error:', error)
        // Fallback to local data if Firebase fails (e.g. rules not set)
        const saved = localStorage.getItem('reddit_clone_posts')
        if (saved) {
          try {
            setPosts(JSON.parse(saved))
          } catch {
            setPosts(initialPosts)
          }
        } else {
          setPosts(initialPosts)
        }
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [])

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
    }).catch((err) => {
      console.error('Firebase write error:', err)
      // Fallback: keep local
      const updated = [newPost, ...posts]
      setPosts(updated)
      localStorage.setItem('reddit_clone_posts', JSON.stringify(updated))
    })
  }

  if (loading) {
    return <div className="empty-state">Loading posts...</div>
  }

  return (
    <div className="content-layout">
      <div>
        <CreatePost onPostCreated={handlePostCreated} />
        <div className="post-list">
          {posts.length === 0 ? (
            <div className="empty-state">No posts yet. Be the first to post!</div>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </div>
      <aside className="sidebar">
        <ForumList />
        <div className="sidebar-card">
          <h3>About</h3>
          <p style={{ fontSize: '0.85rem', color: '#7c7c7c' }}>
            Connected to Firebase Realtime Database. Posts sync in real time.
          </p>
        </div>
      </aside>
    </div>
  )
}
