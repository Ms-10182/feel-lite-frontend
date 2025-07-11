import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import BookmarksPage from './pages/BookmarksPage'
import LikedPostsPage from './pages/LikedPostsPage'
import HashtagPage from './pages/HashtagPage'
import SettingsPage from './pages/SettingsPage'
import AdminPage from './pages/AdminPage'
import LoadingSpinner from './components/ui/LoadingSpinner'

function App() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/bookmarks" element={<BookmarksPage />} />
        <Route path="/bookmarks/:bookmarkId" element={<BookmarksPage />} />
        <Route path="/liked" element={<LikedPostsPage />} />
        <Route path="/hashtag" element={<HashtagPage />} />
        <Route path="/hashtag/:tag" element={<HashtagPage />} />
        <Route path="/trending" element={<HashtagPage trendingMode />} />
        <Route path="/settings" element={<SettingsPage />} />
        {user.role === 'admin' && (
          <Route path="/admin" element={<AdminPage />} />
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App