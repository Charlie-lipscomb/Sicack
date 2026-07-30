import { useState, useEffect } from 'react'
import { ref, onValue, push, update } from 'firebase/database'
import { database } from '../firebase'
import { allowAction } from '../utils/rateLimit'

export function usePosts(communityName = null, { sort = 'new' } = {}) {
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
          let list = Object.entries(data)
            .map(([id, post]) => ({ id, ...post }))
            .filter((p) => !p.deleted)

          if (communityName) {
            list = list.filter(
              (p) =>
                p.community?.toLowerCase() === communityName.toLowerCase() ||
                p.forum?.toLowerCase() === communityName.toLowerCase()
            )
          }

          if (sort === 'active') {
            list.sort(
              (a, b) =>
                (b.lastActivityAt || b.createdAt || 0) -
                (a.lastActivityAt || a.createdAt || 0)
            )
          } else {
            list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
          }
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
  }, [communityName, sort])

  const createPost = async (newPost) => {
    if (newPost.authorId && !allowAction(`post:${newPost.authorId}`, { limit: 8, windowMs: 60_000 })) {
      throw new Error('You are posting too quickly. Wait a moment.')
    }
    await push(ref(database, 'posts'), {
      title: newPost.title,
      body: newPost.body || '',
      imageUrl: newPost.imageUrl || '',
      community: newPost.community || newPost.forum,
      author: newPost.author,
      authorId: newPost.authorId || null,
      createdAt: newPost.createdAt || Date.now(),
      lastActivityAt: Date.now(),
      deleted: false,
    })
  }

  const updatePost = async (postId, fields) => {
    await update(ref(database, `posts/${postId}`), {
      ...fields,
      updatedAt: Date.now(),
    })
  }

  const softDeletePost = async (postId) => {
    await update(ref(database, `posts/${postId}`), {
      deleted: true,
      deletedAt: Date.now(),
    })
  }

  return { posts, status, error, createPost, updatePost, softDeletePost }
}
