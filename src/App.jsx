import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Forum from './pages/Forum'
import Search from './pages/Search'
import Login from './pages/Login'

function App() {
  return (
    <div className="app">
      <div className="bg-glow" aria-hidden="true" />
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/r/:forumName" element={<Forum />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
