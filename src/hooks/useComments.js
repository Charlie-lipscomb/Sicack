import { useState, useEffect } from 'react'
import { ref, onValue, push, update, get } from 'firebase/database'
import { database } from '../firebase'
import { allowAction } from '../utils/rateLimit'

export function useComments(postId) {
  const [comments, setComments] = useState([])
  const [status, setStatus] = useState('connecting')

  useEffect(() => {
    if (!postId) {
      setComments([])
      return
    }
    const unsub = onValue(
      ref(database, `comments/${postId}`),
      (snap) => {
        const data = snap.val()
        if (!data) {
          setComments([])
        } else {
          const list = Object.entries(data)
            .map(([id, c]) => ({ id, ...c }))
            .filter((c) => !c.deleted)
          list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
          setComments(list)
        }
        setStatus('live')
      },
      () => setStatus('error')
    )
    return () => unsub()
  }, [postId])

  const addComment = async ({ body, author, authorId }) => {
    const text = body.trim()
    if (!text || !postId) return
    if (authorId && !allowAction(`comment:${authorId}`, { limit: 20, windowMs: 60_000 })) {
      throw new Error('You are replying too quickly. Wait a moment.')
    }
    await push(ref(database, `comments/${postId}`), {
      body: text,
      author,
      authorId: authorId || null,
      createdAt: Date.now(),
      deleted: false,
    })
    try {
      await update(ref(database, `posts/${postId}`), {
        lastActivityAt: Date.now(),
      })
    } catch {
      /* post may be missing */
    }
  }

  const softDeleteComment = async (commentId) => {
    if (!postId || !commentId) return
    await update(ref(database, `comments/${postId}/${commentId}`), {
      deleted: true,
      deletedAt: Date.now(),
    })
  }

  return { comments, status, addComment, softDeleteComment }
}
