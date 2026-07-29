import { useState, useEffect } from 'react'
import { ref, onValue, push, set, get, update, query, orderByChild, limitToLast } from 'firebase/database'
import { database } from '../firebase'

export function chatIdFor(uidA, uidB) {
  return [uidA, uidB].sort().join('_')
}

/** Find a user by username or email */
export async function findUser(queryText) {
  const q = queryText.trim().toLowerCase()
  if (!q) return null

  // Username index
  const byName = await get(ref(database, `usernames/${q}`))
  if (byName.exists()) {
    const uid = byName.val()
    const profile = await get(ref(database, `users/${uid}`))
    if (profile.exists()) return { uid, ...profile.val() }
  }

  // Email index (dots stored as commas)
  if (q.includes('@')) {
    const emailKey = q.replace(/\./g, ',')
    const byEmail = await get(ref(database, `emails/${emailKey}`))
    if (byEmail.exists()) {
      const uid = byEmail.val()
      const profile = await get(ref(database, `users/${uid}`))
      if (profile.exists()) return { uid, ...profile.val() }
    }
  }

  // Fallback: scan users (fine for small apps)
  const all = await get(ref(database, 'users'))
  if (all.exists()) {
    for (const [uid, profile] of Object.entries(all.val())) {
      if (
        profile.username?.toLowerCase() === q ||
        profile.email?.toLowerCase() === q
      ) {
        return { uid, ...profile }
      }
    }
  }

  return null
}

export function useConversations(uid) {
  const [conversations, setConversations] = useState([])

  useEffect(() => {
    if (!uid) {
      setConversations([])
      return
    }
    const unsub = onValue(ref(database, `userChats/${uid}`), (snap) => {
      const data = snap.val()
      if (!data) {
        setConversations([])
        return
      }
      const list = Object.entries(data).map(([id, c]) => ({ id, ...c }))
      list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
      setConversations(list)
    })
    return () => unsub()
  }, [uid])

  return conversations
}

export function useChatMessages(chatId) {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    if (!chatId) {
      setMessages([])
      return
    }
    const messagesRef = query(
      ref(database, `chats/${chatId}/messages`),
      orderByChild('createdAt'),
      limitToLast(100)
    )
    const unsub = onValue(messagesRef, (snap) => {
      const data = snap.val()
      if (!data) {
        setMessages([])
        return
      }
      const list = Object.entries(data).map(([id, m]) => ({ id, ...m }))
      list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
      setMessages(list)
    })
    return () => unsub()
  }, [chatId])

  return messages
}

export async function sendMessage({ chatId, fromUid, fromName, toUid, toName, toEmail, text }) {
  const body = text.trim()
  if (!body) return

  const now = Date.now()
  const msgRef = push(ref(database, `chats/${chatId}/messages`))
  await set(msgRef, {
    text: body,
    fromUid,
    fromName,
    createdAt: now,
  })

  const preview = body.length > 60 ? body.slice(0, 60) + '…' : body

  await update(ref(database, `userChats/${fromUid}/${chatId}`), {
    otherUid: toUid,
    otherName: toName,
    otherEmail: toEmail || '',
    lastMessage: preview,
    updatedAt: now,
  })

  await update(ref(database, `userChats/${toUid}/${chatId}`), {
    otherUid: fromUid,
    otherName: fromName,
    lastMessage: preview,
    updatedAt: now,
  })
}
