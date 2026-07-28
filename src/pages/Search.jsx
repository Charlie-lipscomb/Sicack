import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ref, onValue } from 'firebase/database'
import { database } from '../firebase'
import PostCard from '../components/PostCard'
import ForumList from '../components/ForumList'

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

    const postsRef = ref(database, 'posts')
    const unsubscribe = onValue(
      postsRef,
      (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const lower = query.toLowerCase()
          const postList = Object.entries(data)
            .map(([id, post]) => ({ id, ...post }))
            .filter(
              (p) =>
                p.title?.toLowerCase().includes(lower) ||
                (p.body && p.body.toLowerCase().includes(lower)) ||
                p.forum?.toLowerCase().includes(lower) ||
                p.author?.toLowerCase().includes(lower)
            )
            .sort((a, b) => b.createdAt - a.createdAt)
          setResults(postList)
        } else {
          setResults([])
        }
        setLoading(false)
      },
      (error) => {
        console.error('Firebase read error:', error)
        setResults([])
        setLoading(false)
      }
    )
    return () => unsubscribe()
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
