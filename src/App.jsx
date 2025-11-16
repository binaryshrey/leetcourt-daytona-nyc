import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './Layout'
import BattleArena from './pages/BattleArena'
import CaseLibrary from './pages/CaseLibrary'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/battlearena" replace />} />
      <Route
        path="/battlearena"
        element={
          <Layout currentPageName="BattleArena">
            <BattleArena />
          </Layout>
        }
      />
      <Route
        path="/caselibrary"
        element={
          <Layout currentPageName="CaseLibrary">
            <CaseLibrary />
          </Layout>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <Layout currentPageName="Leaderboard">
            <Leaderboard />
          </Layout>
        }
      />
      <Route
        path="/profile"
        element={
          <Layout currentPageName="Profile">
            <Profile />
          </Layout>
        }
      />
    </Routes>
  )
}

export default App
