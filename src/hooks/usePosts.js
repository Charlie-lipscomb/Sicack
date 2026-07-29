import { useState, useEffect } from 'react'
import { ref, onValue, push, get, set } from 'firebase/database'
import { database } from '../firebase'
import { initialPosts } from '../data/mockData'

/**
 * Live posts from Firebase Realtime Database.
 * Optionally filter by forum name.
 */
export function usePosts(forumName = null) {
  const [posts, setPosts] = useState([])
  const [status, setStatus] = useState('connecting') // connecting | live | error
  const [error, setError] = useState(null)

  useEffect(() => {
    const postsRef = ref(database, 'posts')

    const unsubscribe = onValue(
      postsRef,
      async (snapshot) => {
        const data = snapshot.val()

        if (!data) {
          // Empty DB: seed sample posts once
          try {
            const seededRef = ref(database, 'meta/seeded')
            const seededSnap = await get(seededRef)
            if (!seededSnap.exists()) {
              await set(seededRef, true)
              for (const post of initialPosts) {
                await push(postsRef, {
                  title: post.title,
                  body: post.body,
                  forum: post.forum,
                  author: post.author,
                  createdAt: post.createdAt,
                  upvotes: post.upvotes,
                  comments: post.comments,
                })
              }
            }
          } catch (e) {
            console.warn('[Sicack] Could not seed DB (check rules):', e.message)
          }
          setPosts([])
        } else {
          let list = Object.entries(data).map(([id, post]) => ({ id, ...post }))
          if (forumName) {
            list = list.filter(
              (p) => p.forum?.toLowerCase() === forumName.toLowerCase()
            )
          }
          list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
          setPosts(list)
        }

        setStatus('live')
        setError(null)
      },
      (err) => {
        console.error('[Sicack] Firebase error:', err)
        setStatus('error')
        setError(err.message || 'Permission denied or network error')
        setPosts([])
      }
    )

    return () => unsubscribe()
  }, [forumName])

  const createPost = async (newPost) => {
    const postsRef = ref(database, 'posts')
    await push(postsRef, {
      title: newPost.title,
      body: newPost.body,
      forum: newPost.forum,
      author: newPost.author,
      createdAt: newPost.createdAt,
      upvotes: newPost.upvotes ?? 1,
      comments: newPost.comments ?? 0,
    })
  }

  return { posts, status, error, createPost }
}
