import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ref, onValue, remove, update, set } from 'firebase/database'
import { database } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { isAdminUser, isAdminUsername, publicDisplayName } from '../utils/admin'

function emailKey(email) {
  return String(email || '')
    .trim()
    .toLowerCase()
    .replace(/\./g, ',')
}

export default function Admin() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('posts')
  const [posts, setPosts] = useState([])
  const [users, setUsers] = useState([])
  const [communities, setCommunities] = useState([])
  const [busyId, setBusyId] = useState(null)
  const [q, setQ] = useState('')

  useEffect(() => {
    if (loading) return
    if (!user || !isAdminUser(user)) navigate('/')
  }, [user, loading, navigate])

  useEffect(() => {
    if (!isAdminUser(user)) return

    const unsubPosts = onValue(ref(database, 'posts'), (snap) => {
      const data = snap.val()
      if (!data) return setPosts([])
      const list = Object.entries(data).map(([id, p]) => ({ id, ...p }))
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      setPosts(list)
    })

    const unsubUsers = onValue(ref(database, 'users'), (snap) => {
      const data = snap.val()
      if (!data) return setUsers([])
      const list = Object.entries(data).map(([uid, u]) => ({ uid, ...u }))
      list.sort((a, b) => (a.username || '').localeCompare(b.username || ''))
      setUsers(list)
    })

    const unsubCommunities = onValue(ref(database, 'communities'), (snap) => {
      const data = snap.val()
      if (!data) return setCommunities([])
      const list = Object.entries(data).map(([id, c]) => ({ id, ...c }))
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      setCommunities(list)
    })

    return () => {
      unsubPosts()
      unsubUsers()
      unsubCommunities()
    }
  }, [user])

  const lower = q.trim().toLowerCase()

  const filteredPosts = useMemo(() => {
    if (!lower) return posts
    return posts.filter(
      (p) =>
        p.title?.toLowerCase().includes(lower) ||
        p.body?.toLowerCase().includes(lower) ||
        p.author?.toLowerCase().includes(lower) ||
        (p.community || p.forum || '').toLowerCase().includes(lower)
    )
  }, [posts, lower])

  const filteredUsers = useMemo(() => {
    if (!lower) return users
    return users.filter((u) => {
      if (isAdminUsername(u.username)) {
        return 'sicack support'.includes(lower) || 'sicack'.includes(lower) || lower.includes('sicack')
      }
      return (
        u.username?.toLowerCase().includes(lower) ||
        u.email?.toLowerCase().includes(lower)
      )
    })
  }, [users, lower])

  const filteredCommunities = useMemo(() => {
    if (!lower) return communities
    return communities.filter(
      (c) =>
        c.name?.toLowerCase().includes(lower) ||
        c.description?.toLowerCase().includes(lower) ||
        c.createdBy?.toLowerCase().includes(lower)
    )
  }, [communities, lower])

  if (loading || !user || !isAdminUser(user)) {
    return <div className="empty-state">Checking access…</div>
  }

  const deletePost = async (id) => {
    if (!confirm('Delete this post permanently?')) return
    setBusyId(id)
    try {
      await remove(ref(database, `posts/${id}`))
      await remove(ref(database, `comments/${id}`))
    } catch (e) {
      alert('Failed: ' + e.message)
    } finally {
      setBusyId(null)
    }
  }

  const deleteCommunity = async (id, name) => {
    if (!confirm(`Delete community “${name}”?`)) return
    setBusyId(id)
    try {
      await remove(ref(database, `communities/${id}`))
    } catch (e) {
      alert('Failed: ' + e.message)
    } finally {
      setBusyId(null)
    }
  }

  const banUser = async (uid, username, email) => {
    if (isAdminUsername(username)) {
      alert('Cannot ban Sicack Support')
      return
    }
    if (!confirm(`Ban ${username}? They cannot sign in with this email.`)) return
    setBusyId(uid)
    try {
      await update(ref(database, `users/${uid}`), {
        banned: true,
        bannedAt: Date.now(),
        bannedBy: 'Sicack Support',
      })
      if (email) await set(ref(database, `bannedEmails/${emailKey(email)}`), true)
    } catch (e) {
      alert('Failed: ' + e.message)
    } finally {
      setBusyId(null)
    }
  }

  const unbanUser = async (uid, email) => {
    setBusyId(uid)
    try {
      await update(ref(database, `users/${uid}`), {
        banned: false,
        bannedAt: null,
        bannedBy: null,
      })
      if (email) await remove(ref(database, `bannedEmails/${emailKey(email)}`))
    } catch (e) {
      alert('Failed: ' + e.message)
    } finally {
      setBusyId(null)
    }
  }

  const deleteUserPosts = async (username) => {
    if (!confirm(`Delete all posts by ${username}?`)) return
    setBusyId('bulk-' + username)
    try {
      const targets = posts.filter(
        (p) => (p.author || '').toLowerCase() === username.toLowerCase()
      )
      await Promise.all(
        targets.map(async (p) => {
          await remove(ref(database, `posts/${p.id}`))
          await remove(ref(database, `comments/${p.id}`))
        })
      )
    } catch (e) {
      alert('Failed: ' + e.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-hero">
        <div>
          <span className="eyebrow">Moderation</span>
          <h1>Admin</h1>
          <p>Search members and content, ban accounts, remove posts</p>
        </div>
        <Link to="/" className="btn btn-ghost btn-sm">
          ← Feed
        </Link>
      </div>

      <div className="admin-search">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter users, posts, communities…"
        />
        {q && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setQ('')}>
            Clear
          </button>
        )}
      </div>

      <div className="segmented">
        <button type="button" className={tab === 'posts' ? 'active' : ''} onClick={() => setTab('posts')}>
          Posts ({filteredPosts.length})
        </button>
        <button type="button" className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>
          Users ({filteredUsers.length})
        </button>
        <button
          type="button"
          className={tab === 'communities' ? 'active' : ''}
          onClick={() => setTab('communities')}
        >
          Communities ({filteredCommunities.length})
        </button>
      </div>

      {tab === 'posts' && (
        <div className="admin-table-wrap">
          {filteredPosts.length === 0 ? (
            <div className="empty-state">No posts match</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Community</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link to={`/post/${p.id}`}><strong>{p.title}</strong></Link>
                      {p.body ? <span className="admin-sub">{p.body.slice(0, 80)}</span> : null}
                    </td>
                    <td>{publicDisplayName(p.author)}</td>
                    <td>{p.community || p.forum || '—'}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        disabled={busyId === p.id}
                        onClick={() => deletePost(p.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'users' && (
        <div className="admin-table-wrap">
          {filteredUsers.length === 0 ? (
            <div className="empty-state">No users match</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const admin = isAdminUsername(u.username)
                  return (
                    <tr key={u.uid}>
                      <td>
                        <strong>{admin ? 'Sicack Support' : u.username}</strong>
                        {admin && <span className="admin-badge">admin</span>}
                      </td>
                      <td>{admin ? '—' : u.email || '—'}</td>
                      <td>
                        {u.banned ? (
                          <span className="status-banned">Banned</span>
                        ) : (
                          <span className="status-ok">Active</span>
                        )}
                      </td>
                      <td className="admin-actions">
                        {!admin && (
                          <>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              disabled={busyId === 'bulk-' + u.username}
                              onClick={() => deleteUserPosts(u.username)}
                            >
                              Clear posts
                            </button>
                            {u.banned ? (
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                disabled={busyId === u.uid}
                                onClick={() => unbanUser(u.uid, u.email)}
                              >
                                Unban
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                disabled={busyId === u.uid}
                                onClick={() => banUser(u.uid, u.username, u.email)}
                              >
                                Ban
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'communities' && (
        <div className="admin-table-wrap">
          {filteredCommunities.length === 0 ? (
            <div className="empty-state">No communities match</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Created by</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredCommunities.map((c) => (
                  <tr key={c.id}>
                    <td><Link to={`/c/${c.name}`}>{c.name}</Link></td>
                    <td>{c.description || '—'}</td>
                    <td>{publicDisplayName(c.createdBy)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        disabled={busyId === c.id}
                        onClick={() => deleteCommunity(c.id, c.name)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
