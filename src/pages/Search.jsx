import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import PostCard from '../components/PostCard'
import ForumList from '../components/ForumList'
import { initialPosts } from '../data/mockData'

export default function Search() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState([])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const saved = localStorage.getItem('reddit_clone_posts')
    let allPosts = initialPosts
    if (saved) {
      try {
        allPosts = JSON.parse(saved)
      } catch {
        /* keep initial */
      }
    }

    const lower = query.toLowerCase()
    const filtered = allPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(lower) ||
        (p.body && p.body.toLowerCase().includes(lower)) ||
        p.forum.toLowerCase().includes(lower) ||
        p.author.toLowerCase().includes(lower)
    )
    setResults(filtered.sort((a, b) => b.createdAt - a.createdAt))
  }, [query])

  return (
    <div className="content-layout">
      <div>
        <h1 className="page-title">
          Search results for &quot;{query}&quot;
        </h1>
        <div className="post-list">
          {results.length === 0 ? (
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
