import { useState, useEffect } from 'react'
import { ref, onValue, push, set, get } from 'firebase/database'
import { database } from '../firebase'

const DEFAULT_COMMUNITIES = [
  { name: 'technology', description: 'Tech news and discussion' },
  { name: 'design', description: 'UI, product, and visual craft' },
  { name: 'gaming', description: 'Games, hardware, and play' },
  { name: 'science', description: 'Discoveries and curiosity' },
  { name: 'general', description: 'Anything goes' },
]

export function useCommunities() {
  const [communities, setCommunities] = useState([])
  const [status, setStatus] = useState('connecting')

  useEffect(() => {
    const communitiesRef = ref(database, 'communities')

    const unsub = onValue(
      communitiesRef,
      async (snapshot) => {
        const data = snapshot.val()
        if (!data) {
          try {
            const seeded = await get(ref(database, 'meta/communitiesSeeded'))
            if (!seeded.exists()) {
              await set(ref(database, 'meta/communitiesSeeded'), true)
              for (const c of DEFAULT_COMMUNITIES) {
                await push(communitiesRef, {
                  name: c.name,
                  description: c.description,
                  createdBy: 'system',
                  createdAt: Date.now(),
                })
              }
            }
          } catch (e) {
            console.warn('[Sicack] community seed failed:', e.message)
          }
          setCommunities([])
        } else {
          const list = Object.entries(data).map(([id, c]) => ({ id, ...c }))
          list.sort((a, b) => a.name.localeCompare(b.name))
          setCommunities(list)
        }
        setStatus('live')
      },
      () => setStatus('error')
    )

    return () => unsub()
  }, [])

  const createCommunity = async ({ name, description, createdBy, createdById }) => {
    const clean = name.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '')
    if (!clean) throw new Error('Enter a valid name (letters, numbers, - _)')
    if (clean.length < 2) throw new Error('Name must be at least 2 characters')

    const exists = communities.some((c) => c.name.toLowerCase() === clean)
    if (exists) throw new Error('That community already exists')

    await push(ref(database, 'communities'), {
      name: clean,
      description: (description || '').trim() || 'A new community on Sicack',
      createdBy: createdBy || 'member',
      createdById: createdById || null,
      createdAt: Date.now(),
    })

    return clean
  }

  return { communities, status, createCommunity }
}
