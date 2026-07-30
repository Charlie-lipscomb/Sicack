import { createContext, useContext, useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { ref, set, get, update } from 'firebase/database'
import { auth, database } from '../firebase'

const AuthContext = createContext(null)

export class BannedError extends Error {
  constructor(message = 'This account has been banned by Sicack Support.') {
    super(message)
    this.name = 'BannedError'
    this.code = 'sicack/banned'
  }
}

function emailKey(email) {
  return String(email || '')
    .trim()
    .toLowerCase()
    .replace(/\./g, ',')
}

async function isEmailBanned(email) {
  const key = emailKey(email)
  if (!key) return false
  const snap = await get(ref(database, `bannedEmails/${key}`))
  return snap.exists() && snap.val() === true
}

async function isUserBanned(uid) {
  if (!uid) return false
  const snap = await get(ref(database, `users/${uid}/banned`))
  return snap.exists() && snap.val() === true
}

async function syncUserIndexes(uid, username, email) {
  if (!uid) return
  const name = (username || 'member').trim()
  const mail = (email || '').trim().toLowerCase()

  await update(ref(database, `users/${uid}`), {
    username: name,
    email: mail,
    updatedAt: Date.now(),
  })

  if (name) {
    await set(ref(database, `usernames/${name.toLowerCase()}`), uid)
  }
  if (mail) {
    await set(ref(database, `emails/${emailKey(mail)}`), uid)
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [banNotice, setBanNotice] = useState('')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          if (await isEmailBanned(firebaseUser.email)) {
            await signOut(auth)
            setUser(null)
            setBanNotice('This account has been banned by Sicack Support.')
            setLoading(false)
            return
          }

          if (await isUserBanned(firebaseUser.uid)) {
            await signOut(auth)
            setUser(null)
            setBanNotice('This account has been banned by Sicack Support.')
            setLoading(false)
            return
          }

          const username =
            firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'member'

          try {
            await syncUserIndexes(firebaseUser.uid, username, firebaseUser.email)
          } catch (e) {
            console.warn('[Sicack] could not sync user index', e.message)
          }

          if (await isUserBanned(firebaseUser.uid) || await isEmailBanned(firebaseUser.email)) {
            await signOut(auth)
            setUser(null)
            setBanNotice('This account has been banned by Sicack Support.')
            setLoading(false)
            return
          }

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            username,
          })
          setBanNotice('')
        } catch (e) {
          console.error('[Sicack] auth gate error', e)
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            username:
              firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'member',
          })
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
    const mail = email.trim().toLowerCase()

    if (await isEmailBanned(mail)) {
      throw new BannedError()
    }

    const nameSnap = await get(ref(database, `usernames/${nameKey}`))
    if (nameSnap.exists()) {
      throw new Error('That display name is already taken')
    }

    const cred = await createUserWithEmailAndPassword(auth, mail, password)
    await updateProfile(cred.user, { displayName: cleanName })
    await syncUserIndexes(cred.user.uid, cleanName, mail)
    await update(ref(database, `users/${cred.user.uid}`), {
      banned: false,
      createdAt: Date.now(),
    })

    setUser({
      uid: cred.user.uid,
      email: cred.user.email,
      username: cleanName,
    })
    setBanNotice('')
    return cred.user
  }

  const login = async (email, password) => {
    const mail = email.trim().toLowerCase()

    if (await isEmailBanned(mail)) {
      throw new BannedError()
    }

    const cred = await signInWithEmailAndPassword(auth, mail, password)

    if (await isUserBanned(cred.user.uid) || await isEmailBanned(cred.user.email)) {
      await signOut(auth)
      throw new BannedError()
    }

    const username =
      cred.user.displayName || cred.user.email?.split('@')[0] || 'member'

    await syncUserIndexes(cred.user.uid, username, cred.user.email)

    if (await isUserBanned(cred.user.uid)) {
      await signOut(auth)
      throw new BannedError()
    }

    setUser({
      uid: cred.user.uid,
      email: cred.user.email,
      username,
    })
    setBanNotice('')
    return cred.user
  }

  const resetPassword = async (email) => {
    const mail = email.trim().toLowerCase()
    if (!mail) throw new Error('Enter your email address')
    await sendPasswordResetEmail(auth, mail)
  }

  const logout = async () => {
    await signOut(auth)
    setUser(null)
  }

  const clearBanNotice = () => setBanNotice('')

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        resetPassword,
        loading,
        banNotice,
        clearBanNotice,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
