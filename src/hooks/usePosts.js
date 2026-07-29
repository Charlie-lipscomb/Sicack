import { useState, useEffect } from 'react'
import { ref, onValue, push } from 'firebase/database'
import { database } from '../firebase'

export function usePosts(communityName = null) {
  const [posts, setPosts] = useState([])
  const [status, setStatus] = useState('connecting')
  const [error, setError] = useState(null)

  useEffect(() => {
    const postsRef = ref(database, 'posts')

    const unsubscribe = onValue(
      postsRef,
      (snapshot) => {
        const data = snapshot.val()
        if (!data) {
          setPosts([])
        } else {
          let list = Object.entries(data).map(([id, post]) => ({ id, ...post }))
          if (communityName) {
            list = list.filter(
              (p) => p.community?.toLowerCase() === communityName.toLowerCase()
                || p.forum?.toLowerCase() === communityName.toLowerCase()
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
  }, [communityName])

  const createPost = async (newPost) => {
    await push(ref(database, 'posts'), {
      title: newPost.title,
      body: newPost.body || '',
      community: newPost.community || newPost.forum,
      author: newPost.author,
      authorId: newPost.authorId || null,
      createdAt: newPost.createdAt || Date.now(),
    })
  }

  return { posts, status, error, createPost }
}
