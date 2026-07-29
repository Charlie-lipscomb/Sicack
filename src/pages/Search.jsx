import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ref, onValue } from 'firebase/database'
import { database } from '../firebase'
import PostCard from '../components/PostCard'
import ForumList from '../components/ForumList'
import { initialPosts } from '../data/mockData'

export default function Search() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    const lower = query.toLowerCase()
    const match = (p) =>
      p.title?.toLowerCase().includes(lower) ||
      (p.body && p.body.toLowerCase().includes(lower)) ||
      p.forum?.toLowerCase().includes(lower) ||
      p.author?.toLowerCase().includes(lower)

    if (!database) {
      setResults(initialPosts.filter(match).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)))
      setLoading(false)
      return
    }

    const postsRef = ref(database, 'posts')
    const unsubscribe = onValue(
      postsRef,
      (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const postList = Object.entries(data)
            .map(([id, post]) => ({ id, ...post }))
            .filter(match)
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
          setResults(postList)
        } else {
          setResults([])
        }
        setLoading(false)
      },
      (error) => {
        console.error('[Sicack] Firebase read error:', error)
        setResults(initialPosts.filter(match))
        setLoading(false)
      }
    )

    const timeout = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          setResults(initialPosts.filter(match))
          return false
        }
        return prev
      })
    }, 4000)

    return () => {
      unsubscribe()
      clearTimeout(timeout)
    }
  }, [query])

  return (
    <div className="content-layout">
      <div>
        <h1 className="page-title">Search results for &quot;{query}&quot;</h1>
        <div className="post-list">
          {loading ? (
            <div className="empty-state">Searching...</div>
          ) : results.length === 0 ? (
            <div className="empty-state">
              {query ? 'No posts matched your search.' : 'Enter a search term above.'}
            </div>
          ) : (
            results.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </div>
      <aside className="sidebar">
        <ForumList />
      </aside>
    </div>
  )
}
