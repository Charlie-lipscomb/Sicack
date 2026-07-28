import { Link } from 'react-router-dom'
import { forums } from '../data/mockData'

export default function ForumList() {
  return (
    <div className="sidebar-card">
      <h3>Popular Forums</h3>
      <ul className="forum-list">
        {forums.map((forum) => (
          <li key={forum.id}>
            <Link to={`/r/${forum.name}`}>r/{forum.name}</Link>
            <span style={{ color: '#7c7c7c', fontSize: '0.75rem', marginLeft: 6 }}>
              {forum.members.toLocaleString()} members
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
