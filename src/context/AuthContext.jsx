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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'member',
        })
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

    const profile = {
      username: cleanName,
      email: email.trim().toLowerCase(),
      createdAt: Date.now(),
    }

    await set(ref(database, `users/${cred.user.uid}`), profile)
    await set(ref(database, `usernames/${nameKey}`), cred.user.uid)
    await set(
      ref(database, `emails/${email.trim().toLowerCase().replace(/\./g, ',')}`),
      cred.user.uid
    )

    setUser({
      uid: cred.user.uid,
      email: cred.user.email,
      username: cleanName,
    })
    return cred.user
  }

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    setUser({
      uid: cred.user.uid,
      email: cred.user.email,
      username: cred.user.displayName || cred.user.email?.split('@')[0] || 'member',
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
