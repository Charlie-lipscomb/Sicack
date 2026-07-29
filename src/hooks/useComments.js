import { useState, useEffect } from 'react'
import { ref, onValue, push } from 'firebase/database'
import { database } from '../firebase'

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
          const list = Object.entries(data).map(([id, c]) => ({ id, ...c }))
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
    await push(ref(database, `comments/${postId}`), {
      body: text,
      author,
      authorId: authorId || null,
      createdAt: Date.now(),
    })
  }

  return { comments, status, addComment }
}
