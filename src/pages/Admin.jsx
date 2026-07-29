import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ref, onValue, remove, update } from 'firebase/database'
import { database } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { isAdminUser, isAdminUsername, publicDisplayName } from '../utils/admin'

export default function Admin() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('posts')
  const [posts, setPosts] = useState([])
  const [users, setUsers] = useState([])
  const [communities, setCommunities] = useState([])
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    if (loading) return
    if (!user || !isAdminUser(user)) {
      navigate('/')
    }
  }, [user, loading, navigate])

  useEffect(() => {
    if (!isAdminUser(user)) return

    const unsubPosts = onValue(ref(database, 'posts'), (snap) => {
      const data = snap.val()
      if (!data) {
        setPosts([])
        return
      }
      const list = Object.entries(data).map(([id, p]) => ({ id, ...p }))
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      setPosts(list)
    })

    const unsubUsers = onValue(ref(database, 'users'), (snap) => {
      const data = snap.val()
      if (!data) {
        setUsers([])
        return
      }
      const list = Object.entries(data).map(([uid, u]) => ({ uid, ...u }))
      list.sort((a, b) => (a.username || '').localeCompare(b.username || ''))
      setUsers(list)
    })

    const unsubCommunities = onValue(ref(database, 'communities'), (snap) => {
      const data = snap.val()
      if (!data) {
        setCommunities([])
        return
      }
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

  if (loading || !user || !isAdminUser(user)) {
    return <div className="empty-state animate-in">Checking access…</div>
  }

  const deletePost = async (id) => {
    if (!confirm('Delete this post permanently?')) return
    setBusyId(id)
    try {
      await remove(ref(database, `posts/${id}`))
    } catch (e) {
      alert('Failed: ' + e.message)
    } finally {
      setBusyId(null)
    }
  }

  const deleteCommunity = async (id, name) => {
    if (!confirm(`Delete community “${name}” permanently?`)) return
    setBusyId(id)
    try {
      await remove(ref(database, `communities/${id}`))
    } catch (e) {
      alert('Failed: ' + e.message)
    } finally {
      setBusyId(null)
    }
  }

  const banUser = async (uid, username) => {
    if (isAdminUsername(username)) {
      alert('Cannot ban the Sicack support account')
      return
    }
    if (!confirm(`Ban ${username}? They will be flagged in the database.`)) return
    setBusyId(uid)
    try {
      await update(ref(database, `users/${uid}`), {
        banned: true,
        bannedAt: Date.now(),
        bannedBy: 'Sicack Support',
      })
    } catch (e) {
      alert('Failed: ' + e.message)
    } finally {
      setBusyId(null)
    }
  }

  const unbanUser = async (uid) => {
    setBusyId(uid)
    try {
      await update(ref(database, `users/${uid}`), {
        banned: false,
        bannedAt: null,
        bannedBy: null,
      })
    } catch (e) {
      alert('Failed: ' + e.message)
    } finally {
      setBusyId(null)
    }
  }

  const deleteUserPosts = async (username) => {
    if (!confirm(`Delete ALL posts by ${username}?`)) return
    setBusyId('bulk-' + username)
    try {
      const targets = posts.filter(
        (p) => (p.author || '').toLowerCase() === username.toLowerCase()
      )
      await Promise.all(targets.map((p) => remove(ref(database, `posts/${p.id}`))))
    } catch (e) {
      alert('Failed: ' + e.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="admin-page animate-in">
      <div className="admin-hero">
        <div>
          <span className="forum-badge">Moderation</span>
          <h1>Admin panel</h1>
          <p>Signed in as Sicack Support · manage users, posts, and communities</p>
        </div>
        <Link to="/" className="btn btn-ghost">
          ← Feed
        </Link>
      </div>

      <div className="admin-tabs">
        <button type="button" className={tab === 'posts' ? 'active' : ''} onClick={() => setTab('posts')}>
          Posts ({posts.length})
        </button>
        <button type="button" className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>
          Users ({users.length})
        </button>
        <button
          type="button"
          className={tab === 'communities' ? 'active' : ''}
          onClick={() => setTab('communities')}
        >
          Communities ({communities.length})
        </button>
      </div>

      {tab === 'posts' && (
        <div className="admin-table-wrap">
          {posts.length === 0 ? (
            <div className="empty-state">No posts</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Community</th>
                  <th>When</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.title}</strong>
                      {p.body ? <span className="admin-sub">{p.body.slice(0, 80)}</span> : null}
                    </td>
                    <td>{publicDisplayName(p.author)}</td>
                    <td>{p.community || p.forum || '—'}</td>
                    <td>{p.createdAt ? new Date(p.createdAt).toLocaleString() : '—'}</td>
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
          {users.length === 0 ? (
            <div className="empty-state">No users</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Posts</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const admin = isAdminUsername(u.username)
                  const postCount = posts.filter(
                    (p) => (p.author || '').toLowerCase() === (u.username || '').toLowerCase()
                  ).length
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
                      <td>{postCount}</td>
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
                                onClick={() => unbanUser(u.uid)}
                              >
                                Unban
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                disabled={busyId === u.uid}
                                onClick={() => banUser(u.uid, u.username)}
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
          {communities.length === 0 ? (
            <div className="empty-state">No communities</div>
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
                {communities.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link to={`/c/${c.name}`}>{c.name}</Link>
                    </td>
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
