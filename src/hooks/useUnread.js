import { useState, useEffect } from 'react'
import { ref, onValue, get } from 'firebase/database'
import { database } from '../firebase'

/** Count conversations with new activity since lastReadAt */
export function useUnreadCount(uid) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!uid) {
      setCount(0)
      return
    }

    const unsub = onValue(ref(database, `userChats/${uid}`), async (snap) => {
      const data = snap.val()
      if (!data) {
        setCount(0)
        return
      }

      let n = 0
      for (const meta of Object.values(data)) {
        const updated = meta.updatedAt || 0
        const read = meta.lastReadAt || 0
        // Unread if someone else sent the last activity after we last opened it
        if (updated > read) {
          n += 1
        }
      }
      setCount(n)
    })

    return () => unsub()
  }, [uid])

  return count
}

export async function markChatRead(uid, chatId) {
  if (!uid || !chatId) return
  const { update } = await import('firebase/database')
  await update(ref(database, `userChats/${uid}/${chatId}`), {
    lastReadAt: Date.now(),
  })
}
