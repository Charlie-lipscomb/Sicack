import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Forum from './pages/Forum'
import Login from './pages/Login'
import CreateCommunity from './pages/CreateCommunity'
import Messages from './pages/Messages'
import Admin from './pages/Admin'
import PostDetail from './pages/PostDetail'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

function App() {
  return (
    <div className="app">
      <div className="bg-mesh" aria-hidden="true" />
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post/:postId" element={<PostDetail />} />
          <Route path="/c/:forumName" element={<Forum />} />
          <Route path="/r/:forumName" element={<Forum />} />
          <Route path="/u/:username" element={<Profile />} />
          <Route path="/communities/new" element={<CreateCommunity />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
