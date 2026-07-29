import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ref, get, onValue } from 'firebase/database'
import { database } from '../firebase'
import PostCard from '../components/PostCard'
import ForumList from '../components/ForumList'
import { usePosts } from '../hooks/usePosts'
import { useAuth } from '../context/AuthContext'
import { publicDisplayName, publicEmail, isAdminUsername } from '../utils/admin'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const tabParam = searchParams.get('tab') || 'posts'
  const [tab, setTab] = useState(tabParam)
  const [localQ, setLocalQ] = useState(query)

  const { posts, status } = usePosts()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [messageHits, setMessageHits] = useState([])
  const [msgLoading, setMsgLoading] = useState(false)

  useEffect(() => {
    setLocalQ(query)
    setTab(searchParams.get('tab') || 'posts')
  }, [query, searchParams])

  // Live users list
  useEffect(() => {
    const unsub = onValue(ref(database, 'users'), (snap) => {
      const data = snap.val()
      if (!data) {
        setUsers([])
        return
      }
      setUsers(
        Object.entries(data).map(([uid, u]) => ({
          uid,
          ...u,
          displayName: publicDisplayName(u.username),
          displayEmail: publicEmail(u.username, u.email),
        }))
      )
    })
    return () => unsub()
  }, [])

  // Search messages the current user can access
  useEffect(() => {
    if (!user || !query.trim() || tab !== 'messages') {
      setMessageHits([])
      return
    }

    let cancelled = false
    ;(async () => {
      setMsgLoading(true)
      try {
        const lower = query.toLowerCase()
        const chatsSnap = await get(ref(database, `userChats/${user.uid}`))
        if (!chatsSnap.exists()) {
          if (!cancelled) setMessageHits([])
          return
        }

        const chats = chatsSnap.val()
        const hits = []

        await Promise.all(
          Object.entries(chats).map(async ([chatId, meta]) => {
            const msgSnap = await get(ref(database, `chats/${chatId}/messages`))
            if (!msgSnap.exists()) return
            const msgs = msgSnap.val()
            for (const [msgId, m] of Object.entries(msgs)) {
              if (m.text?.toLowerCase().includes(lower)) {
                hits.push({
                  id: msgId,
                  chatId,
                  text: m.text,
                  fromName: publicDisplayName(m.fromName),
                  fromUid: m.fromUid,
                  createdAt: m.createdAt,
                  otherName: publicDisplayName(meta.otherName),
                  otherUid: meta.otherUid,
                })
              }
            }
          })
        )

        hits.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        if (!cancelled) setMessageHits(hits)
      } catch (e) {
        console.error('[Sicack] message search failed', e)
        if (!cancelled) setMessageHits([])
      } finally {
        if (!cancelled) setMsgLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user, query, tab])

  const postResults = useMemo(() => {
    if (!query.trim()) return []
    const lower = query.toLowerCase()
    return posts.filter(
      (p) =>
        p.title?.toLowerCase().includes(lower) ||
        (p.body && p.body.toLowerCase().includes(lower)) ||
        (p.community || p.forum || '').toLowerCase().includes(lower) ||
        publicDisplayName(p.author).toLowerCase().includes(lower)
    )
  }, [posts, query])

  const userResults = useMemo(() => {
    if (!query.trim()) return []
    const lower = query.toLowerCase()
    return users.filter((u) => {
      const name = (u.displayName || u.username || '').toLowerCase()
      // Never match Sicack by real email
      if (isAdminUsername(u.username)) {
        return (
          name.includes(lower) ||
          'sicack support'.includes(lower) ||
          'sicack'.includes(lower) ||
          lower.includes('sicack')
        )
      }
      return (
        name.includes(lower) ||
        (u.email && u.email.toLowerCase().includes(lower))
      )
    })
  }, [users, query])

  const switchTab = (next) => {
    setTab(next)
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    params.set('tab', next)
    setSearchParams(params)
  }

  const submitSearch = (e) => {
    e.preventDefault()
    const q = localQ.trim()
    if (!q) return
    const params = new URLSearchParams()
    params.set('q', q)
    params.set('tab', tab)
    setSearchParams(params)
  }

  const openMessage = (hit) => {
    navigate(`/messages?to=${encodeURIComponent(hit.otherName === 'Sicack Support' ? 'Sicack' : hit.otherName)}`)
  }

  return (
    <div className="content-layout">
      <div className="feed">
        <div className="page-hero animate-in">
          <h1>Search</h1>
          <p>Find posts, people, and messages by keyword</p>
        </div>

        <form className="search-page-form animate-in" onSubmit={submitSearch}>
          <input
            type="search"
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            placeholder="Keywords, username, email…"
            autoFocus
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        <div className="admin-tabs animate-in" style={{ marginBottom: 16 }}>
          <button type="button" className={tab === 'posts' ? 'active' : ''} onClick={() => switchTab('posts')}>
            Posts ({query ? postResults.length : '—'})
          </button>
          <button type="button" className={tab === 'users' ? 'active' : ''} onClick={() => switchTab('users')}>
            Users ({query ? userResults.length : '—'})
          </button>
          <button
            type="button"
            className={tab === 'messages' ? 'active' : ''}
            onClick={() => switchTab('messages')}
          >
            Messages ({query && user ? messageHits.length : '—'})
          </button>
        </div>

        {!query.trim() && (
          <div className="empty-state animate-in">Enter a keyword above to search.</div>
        )}

        {query.trim() && tab === 'posts' && (
          <div className="post-list">
            {status === 'connecting' ? (
              <div className="empty-state animate-in">Searching posts…</div>
            ) : postResults.length === 0 ? (
              <div className="empty-state animate-in">No posts matched “{query}”.</div>
            ) : (
              postResults.map((post, i) => (
                <PostCard
                  key={post.id}
                  post={post}
                  style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                />
              ))
            )}
          </div>
        )}

        {query.trim() && tab === 'users' && (
          <div className="search-user-list">
            {userResults.length === 0 ? (
              <div className="empty-state animate-in">No users matched “{query}”.</div>
            ) : (
              userResults.map((u, i) => (
                <div
                  key={u.uid}
                  className="search-user-card animate-in"
                  style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                >
                  <span className="convo-avatar">{(u.displayName || '?').charAt(0).toUpperCase()}</span>
                  <div className="search-user-meta">
                    <strong>{u.displayName}</strong>
                    {u.displayEmail ? (
                      <span className="thread-email">{u.displayEmail}</span>
                    ) : isAdminUsername(u.username) ? (
                      <span className="thread-email">Official support</span>
                    ) : null}
                    {u.banned && <span className="status-banned">Banned</span>}
                  </div>
                  {user && u.uid !== user.uid && (
                    <Link
                      to={`/messages?to=${encodeURIComponent(
                        isAdminUsername(u.username) ? 'Sicack' : u.username
                      )}`}
                      className="btn btn-ghost btn-sm"
                    >
                      Message
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {query.trim() && tab === 'messages' && (
          <div className="search-msg-list">
            {!user ? (
              <div className="empty-state animate-in">
                <Link to="/login">Sign in</Link> to search your messages.
              </div>
            ) : msgLoading ? (
              <div className="empty-state animate-in">Searching messages…</div>
            ) : messageHits.length === 0 ? (
              <div className="empty-state animate-in">
                No messages of yours matched “{query}”.
              </div>
            ) : (
              messageHits.map((m, i) => (
                <button
                  key={m.id + m.chatId}
                  type="button"
                  className="search-msg-card animate-in"
                  style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                  onClick={() => openMessage(m)}
                >
                  <div className="search-msg-top">
                    <strong>{m.otherName}</strong>
                    <time>
                      {m.createdAt
                        ? new Date(m.createdAt).toLocaleString()
                        : ''}
                    </time>
                  </div>
                  <p className="search-msg-text">
                    <span className="search-msg-from">{m.fromName}: </span>
                    {m.text}
                  </p>
                </button>
              ))
            )}
          </div>
        )}
      </div>
      <aside className="sidebar">
        <ForumList />
        <div className="sidebar-card animate-in">
          <h3>Search tips</h3>
          <p className="sidebar-text">
            · <strong>Posts</strong> — title, body, community, author
            <br />
            · <strong>Users</strong> — username or email
            <br />
            · <strong>Messages</strong> — keywords in chats you’re part of
          </p>
        </div>
      </aside>
    </div>
  )
}
