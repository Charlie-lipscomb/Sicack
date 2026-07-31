import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { database } from '../firebase'

/** Live map of postId → non-deleted comment count */
export function useCommentCounts() {
  const [counts, setCounts] = useState({})

  useEffect(() => {
    const unsub = onValue(ref(database, 'comments'), (snap) => {
      const data = snap.val() || {}
      const next = {}
      for (const [postId, comments] of Object.entries(data)) {
        if (!comments) {
          next[postId] = 0
          continue
        }
        next[postId] = Object.values(comments).filter((c) => c && !c.deleted).length
      }
      setCounts(next)
    })
    return () => unsub()
  }, [])

  return counts
}
