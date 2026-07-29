import { createContext, useContext, useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth'
import { ref, set, get } from 'firebase/database'
import { auth, database } from '../firebase'

const AuthContext = createContext(null)

async function syncUserIndexes(uid, username, email) {
  if (!uid) return
  const name = (username || 'member').trim()
  const mail = (email || '').trim().toLowerCase()

  await set(ref(database, `users/${uid}`), {
    username: name,
    email: mail,
    updatedAt: Date.now(),
  })

  if (name) {
    await set(ref(database, `usernames/${name.toLowerCase()}`), uid)
  }
  if (mail) {
    await set(ref(database, `emails/${mail.replace(/\./g, ',')}`), uid)
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const username =
          firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'member'
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          username,
        })
        try {
          await syncUserIndexes(firebaseUser.uid, username, firebaseUser.email)
        } catch (e) {
          console.warn('[Sicack] could not sync user index', e.message)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const signup = async (email, password, username) => {
    const cleanName = username.trim()
    const nameKey = cleanName.toLowerCase()

    const nameSnap = await get(ref(database, `usernames/${nameKey}`))
    if (nameSnap.exists()) {
      throw new Error('That display name is already taken')
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: cleanName })
    await syncUserIndexes(cred.user.uid, cleanName, email)

    setUser({
      uid: cred.user.uid,
      email: cred.user.email,
      username: cleanName,
    })
    return cred.user
  }

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const username =
      cred.user.displayName || cred.user.email?.split('@')[0] || 'member'
    await syncUserIndexes(cred.user.uid, username, cred.user.email)
    setUser({
      uid: cred.user.uid,
      email: cred.user.email,
      username,
    })
    return cred.user
  }

  const logout = async () => {
    await signOut(auth)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
