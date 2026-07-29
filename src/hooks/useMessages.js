import { useState, useEffect } from 'react'
import { ref, onValue, push, set, get, update, query, orderByChild, limitToLast } from 'firebase/database'
import { database } from '../firebase'
import { isAdminUsername, publicDisplayName, publicProfile } from '../utils/admin'

export function chatIdFor(uidA, uidB) {
  return [uidA, uidB].sort().join('_')
}

/** Find a user by username or email — Sicack account never exposes email */
export async function findUser(queryText) {
  const q = queryText.trim().toLowerCase()
  if (!q) return null

  const byName = await get(ref(database, `usernames/${q}`))
  if (byName.exists()) {
    const uid = byName.val()
    const profile = await get(ref(database, `users/${uid}`))
    if (profile.exists()) return publicProfile({ uid, ...profile.val() })
  }

  if (q.includes('@')) {
    const emailKey = q.replace(/\./g, ',')
    const byEmail = await get(ref(database, `emails/${emailKey}`))
    if (byEmail.exists()) {
      const uid = byEmail.val()
      const profile = await get(ref(database, `users/${uid}`))
      if (profile.exists()) {
        const data = profile.val()
        // Do not reveal Sicack via email search result details
        if (isAdminUsername(data.username)) {
          return publicProfile({ uid, ...data })
        }
        return publicProfile({ uid, ...data })
      }
    }
  }

  const all = await get(ref(database, 'users'))
  if (all.exists()) {
    for (const [uid, profile] of Object.entries(all.val())) {
      if (
        profile.username?.toLowerCase() === q ||
        profile.email?.toLowerCase() === q
      ) {
        return publicProfile({ uid, ...profile })
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
      const list = Object.entries(data).map(([id, c]) => {
        const name = publicDisplayName(c.otherName)
        return {
          id,
          ...c,
          otherName: name,
          // Never surface Sicack email in the UI
          otherEmail: isAdminUsername(c.otherName) ? '' : c.otherEmail || '',
        }
      })
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
      const list = Object.entries(data).map(([id, m]) => ({
        id,
        ...m,
        fromName: publicDisplayName(m.fromName),
      }))
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
  const safeFrom = publicDisplayName(fromName)
  const safeTo = publicDisplayName(toName)
  const safeToEmail = isAdminUsername(toName) ? '' : toEmail || ''
  const safeFromEmailHidden = isAdminUsername(fromName)

  const msgRef = push(ref(database, `chats/${chatId}/messages`))
  await set(msgRef, {
    text: body,
    fromUid,
    fromName: safeFrom,
    createdAt: now,
  })

  const preview = body.length > 60 ? body.slice(0, 60) + '…' : body

  await update(ref(database, `userChats/${fromUid}/${chatId}`), {
    otherUid: toUid,
    otherName: safeTo,
    otherEmail: safeToEmail,
    lastMessage: preview,
    updatedAt: now,
  })

  await update(ref(database, `userChats/${toUid}/${chatId}`), {
    otherUid: fromUid,
    otherName: safeFrom,
    otherEmail: safeFromEmailHidden ? '' : '',
    lastMessage: preview,
    updatedAt: now,
  })
}
