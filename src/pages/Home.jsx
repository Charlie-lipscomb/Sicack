import { useState, useEffect } from 'react'
import PostCard from '../components/PostCard'
import CreatePost from '../components/CreatePost'
import ForumList from '../components/ForumList'
import { initialPosts } from '../data/mockData'
// import { database } from '../firebase'
// import { ref, onValue, push } from 'firebase/database'

export default function Home() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    // PLACEHOLDER for Firebase Realtime Database
    // When configured, replace mock data with:
    //
    // const postsRef = ref(database, 'posts')
    // const unsubscribe = onValue(postsRef, (snapshot) => {
    //   const data = snapshot.val()
    //   if (data) {
    //     const postList = Object.entries(data).map(([id, post]) => ({ id, ...post }))
    //     setPosts(postList.sort((a, b) => b.createdAt - a.createdAt))
    //   }
    // })
    // return () => unsubscribe()

    // Using local mock data + localStorage for persistence during demo
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
  }, [])

  const handlePostCreated = (newPost) => {
    const updated = [newPost, ...posts]
    setPosts(updated)
    localStorage.setItem('reddit_clone_posts', JSON.stringify(updated))

    // Firebase write example (uncomment when configured):
    // import { ref, push } from 'firebase/database'
    // push(ref(database, 'posts'), newPost)
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
            A Reddit-like demo app. Data is stored locally until you connect Firebase Realtime Database.
          </p>
        </div>
      </aside>
    </div>
  )
}
