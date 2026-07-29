import { Link } from 'react-router-dom'
import { useCommunities } from '../hooks/useCommunities'

export default function ForumList() {
  const { communities } = useCommunities()

  return (
    <div className="sidebar-card animate-in">
      <div className="sidebar-card-head">
        <h3>Communities</h3>
        <Link to="/communities/new" className="btn btn-ghost btn-sm">
          + New
        </Link>
      </div>
      <ul className="forum-list">
        {communities.length === 0 ? (
          <li className="forum-empty">None yet — create one</li>
        ) : (
          communities.map((c, i) => (
            <li key={c.id} style={{ animationDelay: `${i * 40}ms` }} className="animate-in">
              <Link to={`/c/${c.name}`}>
                <span className="forum-dot" />
                {c.name}
              </Link>
            </li>
          ))
        )}
      </ul>
      <Link to="/communities/new" className="sidebar-link">
        Create a community →
      </Link>
    </div>
  )
}
