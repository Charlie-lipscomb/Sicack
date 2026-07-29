import { useState, useEffect } from 'react'
import { ref, onValue, push } from 'firebase/database'
import { database } from '../firebase'
import PostCard from '../components/PostCard'
import CreatePost from '../components/CreatePost'
import ForumList from '../components/ForumList'
import { initialPosts } from '../data/mockData'

function loadLocalPosts() {
  try {
    const saved = localStorage.getItem('reddit_clone_posts')
    if (saved) return JSON.parse(saved)
  } catch {
    /* ignore */
  }
  return initialPosts
}

export default function Home() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // No Firebase — use local data immediately
    if (!database) {
      setPosts(loadLocalPosts())
      setLoading(false)
      return
    }

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
          setPosts(postList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)))
        } else {
          // Seed once when DB is empty (only if rules allow writes)
          setPosts(initialPosts)
          initialPosts.forEach((post) => {
            push(postsRef, {
              title: post.title,
              body: post.body,
              forum: post.forum,
              author: post.author,
              createdAt: post.createdAt,
              upvotes: post.upvotes,
              comments: post.comments,
            }).catch(() => {})
          })
        }
        setLoading(false)
      },
      (error) => {
        console.error('[Sicack] Firebase read error:', error)
        setPosts(loadLocalPosts())
        setLoading(false)
      }
    )

    // Safety timeout so we never stick on "Loading..." forever
    const timeout = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          setPosts(loadLocalPosts())
          return false
        }
        return prev
      })
    }, 4000)

    return () => {
      unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const handlePostCreated = (newPost) => {
    if (database) {
      push(ref(database, 'posts'), {
        title: newPost.title,
        body: newPost.body,
        forum: newPost.forum,
        author: newPost.author,
        createdAt: newPost.createdAt,
        upvotes: newPost.upvotes,
        comments: newPost.comments,
      }).catch((err) => {
        console.error('[Sicack] Firebase write error:', err)
        const updated = [newPost, ...posts]
        setPosts(updated)
        localStorage.setItem('reddit_clone_posts', JSON.stringify(updated))
      })
    } else {
      const updated = [newPost, ...posts]
      setPosts(updated)
      localStorage.setItem('reddit_clone_posts', JSON.stringify(updated))
    }
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
            {database
              ? 'Connected to Firebase Realtime Database. Posts sync in real time.'
              : 'Running on local data (Firebase not available).'}
          </p>
        </div>
      </aside>
    </div>
  )
}
