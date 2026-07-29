import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ref, onValue, push } from 'firebase/database'
import { database } from '../firebase'
import PostCard from '../components/PostCard'
import CreatePost from '../components/CreatePost'
import ForumList from '../components/ForumList'
import { initialPosts, forums } from '../data/mockData'

export default function Forum() {
  const { forumName } = useParams()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const forum = forums.find(
    (f) => f.name.toLowerCase() === forumName?.toLowerCase()
  )

  useEffect(() => {
    const filterPosts = (list) =>
      list
        .filter((p) => p.forum?.toLowerCase() === forumName?.toLowerCase())
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))

    if (!database) {
      setPosts(filterPosts(initialPosts))
      setLoading(false)
      return
    }

    const postsRef = ref(database, 'posts')
    const unsubscribe = onValue(
      postsRef,
      (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const postList = Object.entries(data).map(([id, post]) => ({ id, ...post }))
          setPosts(filterPosts(postList))
        } else {
          setPosts([])
        }
        setLoading(false)
      },
      (error) => {
        console.error('[Sicack] Firebase read error:', error)
        setPosts(filterPosts(initialPosts))
        setLoading(false)
      }
    )

    const timeout = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          setPosts(filterPosts(initialPosts))
          return false
        }
        return prev
      })
    }, 4000)

    return () => {
      unsubscribe()
      clearTimeout(timeout)
    }
  }, [forumName])

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
      }).catch((err) => console.error('[Sicack] Firebase write error:', err))
    } else if (newPost.forum.toLowerCase() === forumName?.toLowerCase()) {
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
