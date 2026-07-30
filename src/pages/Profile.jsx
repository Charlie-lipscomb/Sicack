import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ref, get, onValue } from 'firebase/database'
import { database } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { publicDisplayName, publicEmail, isAdminUsername } from '../utils/admin'
import PostCard from '../components/PostCard'
import { FeedSkeleton } from '../components/Skeleton'

export default function Profile() {
  const { username } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const name = decodeURIComponent(username || '').trim()

  useEffect(() => {
    let unsub = () => {}
    ;(async () => {
      setLoading(true)
      setNotFound(false)
      try {
        const nameKey = name.toLowerCase()
        // Try username index first
        let uidSnap = await get(ref(database, `usernames/${nameKey}`))
        let uid = uidSnap.exists() ? uidSnap.val() : null

        // Fallback: scan users (small apps)
        if (!uid) {
          const usersSnap = await get(ref(database, 'users'))
          const users = usersSnap.val() || {}
          for (const [id, u] of Object.entries(users)) {
            if (String(u.username || '').toLowerCase() === nameKey) {
              uid = id
              break
            }
          }
        }

        // Admin display name mapping
        if (!uid && isAdminUsername(name)) {
          const usersSnap = await get(ref(database, 'users'))
          const users = usersSnap.val() || {}
          for (const [id, u] of Object.entries(users)) {
            if (isAdminUsername(u.username)) {
              uid = id
              break
            }
          }
        }

        if (!uid) {
          setNotFound(true)
          setProfile(null)
          setPosts([])
          setLoading(false)
          return
        }

        const userSnap = await get(ref(database, `users/${uid}`))
        const data = userSnap.val() || {}
        setProfile({
          uid,
          username: data.username || name,
          email: data.email || '',
          banned: !!data.banned,
        })

        unsub = onValue(ref(database, 'posts'), (snap) => {
          const all = snap.val() || {}
          const list = Object.entries(all)
            .map(([id, p]) => ({ id, ...p }))
            .filter((p) => !p.deleted && p.authorId === uid)
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
          setPosts(list)
          setLoading(false)
        })
      } catch (e) {
        console.error(e)
        setNotFound(true)
        setLoading(false)
      }
    })()
    return () => unsub()
  }, [name])

  if (loading) {
    return (
      <div>
        <div className="empty-state" style={{ marginBottom: 16 }}>
          Loading profile…
        </div>
        <FeedSkeleton count={2} />
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="empty-state">
        <h2>Member not found</h2>
        <p>No profile matches that name.</p>
        <div className="empty-actions">
          <Link to="/" className="btn btn-primary btn-sm">
            Home
          </Link>
        </div>
      </div>
    )
  }

  const display = publicDisplayName(profile.username)
  const email = publicEmail(profile.username, profile.email)
  const isSelf = user?.uid === profile.uid

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-avatar">{display.charAt(0).toUpperCase()}</div>
        <div className="profile-info">
          <h1>{display}</h1>
          {email ? <p className="profile-email">{email}</p> : null}
          {profile.banned ? <p className="status-banned">Banned</p> : null}
          <div className="profile-actions">
            {!isSelf && user ? (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() =>
                  navigate(`/messages?to=${encodeURIComponent(profile.username)}`)
                }
              >
                Message
              </button>
            ) : null}
            {isSelf ? (
              <Link to="/messages" className="btn btn-secondary btn-sm">
                Your messages
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <h2 className="profile-posts-heading">
        Posts ({posts.length})
      </h2>
      {posts.length === 0 ? (
        <div className="empty-state">
          <p>No posts yet.</p>
        </div>
      ) : (
        <div className="post-list">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  )
}
