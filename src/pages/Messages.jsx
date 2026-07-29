import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  useConversations,
  useChatMessages,
  findUser,
  chatIdFor,
  sendMessage,
} from '../hooks/useMessages'
import { publicDisplayName, publicEmail, isAdminUsername } from '../utils/admin'
import { markChatRead } from '../hooks/useUnread'

export default function Messages() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const conversations = useConversations(user?.uid)

  const [activeChat, setActiveChat] = useState(null)
  const [peer, setPeer] = useState(null)
  const [lookup, setLookup] = useState('')
  const [lookupError, setLookupError] = useState('')
  const [lookupBusy, setLookupBusy] = useState(false)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  const messages = useChatMessages(activeChat)

  useEffect(() => {
    const to = searchParams.get('to')
    if (!to || !user) return
    ;(async () => {
      const found = await findUser(to)
      if (found && found.uid !== user.uid) {
        openChat(found)
        setSearchParams({})
      }
    })()
  }, [searchParams, user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeChat])

  useEffect(() => {
    if (user?.uid && activeChat) {
      markChatRead(user.uid, activeChat).catch(() => {})
    }
  }, [user?.uid, activeChat, messages.length])

  if (!user) {
    return (
      <div className="empty-state">
        <h2>Messages</h2>
        <p><Link to="/login">Sign in</Link> to message members.</p>
      </div>
    )
  }

  const openChat = (person) => {
    const id = chatIdFor(user.uid, person.uid)
    setActiveChat(id)
    setPeer({
      uid: person.uid,
      username: publicDisplayName(person.username),
      email: publicEmail(person.username, person.email),
    })
    setLookupError('')
    markChatRead(user.uid, id).catch(() => {})
  }

  const handleFind = async (e) => {
    e.preventDefault()
    setLookupError('')
    setLookupBusy(true)
    try {
      const found = await findUser(lookup)
      if (!found) {
        setLookupError('No member found')
        return
      }
      if (found.uid === user.uid) {
        setLookupError("You can't message yourself")
        return
      }
      openChat(found)
      setLookup('')
    } catch (err) {
      setLookupError(err.message || 'Search failed')
    } finally {
      setLookupBusy(false)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!draft.trim() || !activeChat || !peer) return
    setSending(true)
    try {
      await sendMessage({
        chatId: activeChat,
        fromUid: user.uid,
        fromName: user.username,
        toUid: peer.uid,
        toName: isAdminUsername(peer.username) ? 'Sicack' : peer.username,
        toEmail: peer.email || '',
        text: draft,
      })
      setDraft('')
      await markChatRead(user.uid, activeChat)
    } catch (err) {
      alert('Could not send: ' + err.message)
    } finally {
      setSending(false)
    }
  }

  const openFromList = (c) => {
    setActiveChat(c.id)
    setPeer({
      uid: c.otherUid,
      username: publicDisplayName(c.otherName),
      email: publicEmail(c.otherName, c.otherEmail),
    })
    markChatRead(user.uid, c.id).catch(() => {})
  }

  const peerLabel = peer ? publicDisplayName(peer.username) : ''

  return (
    <div className="messages-layout">
      <aside className="messages-sidebar">
        <h1 className="messages-title">Messages</h1>

        <form className="find-user" onSubmit={handleFind}>
          <input
            type="text"
            value={lookup}
            onChange={(e) => setLookup(e.target.value)}
            placeholder="Username or email"
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={lookupBusy}>
            Find
          </button>
        </form>
        {lookupError && <p className="lookup-error">{lookupError}</p>}

        <ul className="convo-list">
          {conversations.length === 0 ? (
            <li className="convo-empty">No conversations yet</li>
          ) : (
            conversations.map((c) => {
              const unread = (c.updatedAt || 0) > (c.lastReadAt || 0)
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    className={`convo-item ${activeChat === c.id ? 'active' : ''} ${unread ? 'unread' : ''}`}
                    onClick={() => openFromList(c)}
                  >
                    <span className="convo-avatar">
                      {(c.otherName || '?').charAt(0).toUpperCase()}
                    </span>
                    <span className="convo-meta">
                      <span className="convo-name">
                        {c.otherName}
                        {unread && <span className="unread-dot" />}
                      </span>
                      <span className="convo-preview">{c.lastMessage}</span>
                    </span>
                  </button>
                </li>
              )
            })
          )}
        </ul>
      </aside>

      <section className="messages-thread">
        {!activeChat || !peer ? (
          <div className="thread-empty">
            <p>Select a conversation or find someone by username.</p>
          </div>
        ) : (
          <>
            <div className="thread-header">
              <span className="convo-avatar">{peerLabel.charAt(0).toUpperCase()}</span>
              <div>
                <strong>{peerLabel}</strong>
                {peer.email ? (
                  <span className="thread-email">{peer.email}</span>
                ) : peerLabel === 'Sicack Support' ? (
                  <span className="thread-email">Official support</span>
                ) : null}
              </div>
            </div>
            <div className="thread-messages">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`bubble ${m.fromUid === user.uid ? 'mine' : 'theirs'}`}
                >
                  <p>{m.text}</p>
                  <time>
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <form className="thread-compose" onSubmit={handleSend}>
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Message ${peerLabel}`}
                maxLength={2000}
              />
              <button type="submit" className="btn btn-primary" disabled={sending || !draft.trim()}>
                Send
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
