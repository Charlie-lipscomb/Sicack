import { Link } from 'react-router-dom'
import { forums } from '../data/mockData'

export default function ForumList() {
  return (
    <div className="sidebar-card animate-in">
      <h3>Communities</h3>
      <ul className="forum-list">
        {forums.map((forum, i) => (
          <li key={forum.id} style={{ animationDelay: `${i * 40}ms` }} className="animate-in">
            <Link to={`/r/${forum.name}`}>
              <span className="forum-dot" />
              {forum.name}
            </Link>
            <span className="forum-members">{(forum.members / 1000).toFixed(1)}k</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
