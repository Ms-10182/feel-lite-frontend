import React, { useState } from 'react'
import { Camera, Mail, Calendar, Settings, User, Archive } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useUpdateAvatar, useUpdateCoverImage, useChangeUsername } from '../hooks/useProfile'
import { useMyPosts, useArchivedPosts } from '../hooks/usePosts'
import { Button } from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import MyPostsList from '../components/post/MyPostsList'
import ArchivedPostsList from '../components/post/ArchivedPostsList'
import { formatDate } from '../lib/utils'

const ProfilePage: React.FC = () => {
  const { user, refetchUser } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'posts' | 'archived' | 'about'>('posts')
  
  const updateAvatarMutation = useUpdateAvatar()
  const updateCoverImageMutation = useUpdateCoverImage()
  const changeUsernameMutation = useChangeUsername()
  
  // Get user's posts for stats
  const { data: postsData } = useMyPosts()
  const { data: archivedData } = useArchivedPosts()

  const handleAvatarChange = async () => {
    if (window.confirm('Do you want to get a new avatar?')) {
      try {
        // Generate random number between 1-1000 for avatarIdx
        const avatarIdx = Math.floor(Math.random() * 1000) + 1
        await updateAvatarMutation.mutateAsync(avatarIdx)
        refetchUser()
      } catch (error) {
        // Error handling is done in the hook
      }
    }
  }

  const handleCoverImageChange = async () => {
    if (window.confirm('Do you want to get a new cover image?')) {
      try {
        // Generate random number between 1-1000 for coverImageIdx
        const coverImageIdx = Math.floor(Math.random() * 1000) + 1
        await updateCoverImageMutation.mutateAsync(coverImageIdx)
        refetchUser()
      } catch (error) {
        // Error handling is done in the hook
      }
    }
  }

  const handleUsernameChange = async () => {
    if (window.confirm('Do you want to get a new username?')) {
      try {
        // Generate random number between 1-1000 for avatarIdx (keeping variable name for API consistency)
        const avatarIdx = Math.floor(Math.random() * 1000) + 1
        await changeUsernameMutation.mutateAsync()
        refetchUser()
      } catch (error) {
        // Error handling is done in the hook
      }
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-0 xs:px-2 sm:px-4 lg:px-8">
        {/* Profile Header Card */}
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          {/* Cover Image */}
          <div className="relative h-36 xs:h-40 sm:h-48 md:h-56 lg:h-64 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
            {user.coverImage ? (
              <img
                src={user.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center">
                <div className="text-center">
                  <User className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-1 sm:mb-2" />
                  <p className="text-xs sm:text-sm text-muted-foreground">No cover image</p>
                </div>
              </div>
            )}
            
            {/* Cover Image Edit Button */}
            <button
              onClick={() => handleCoverImageChange()}
              className="absolute top-3 sm:top-4 right-3 sm:right-4 p-2 sm:p-2.5 bg-card/90 backdrop-blur-sm text-foreground rounded-full hover:bg-card transition-all duration-200 shadow-lg border border-border/50"
            >
              <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>

          {/* Profile Info */}
          <div className="px-4 sm:px-6 pb-6">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4 sm:mb-6">
              <div className="relative inline-block">
                <Avatar
                  src={user.avatar}
                  alt={user.username}
                  fallback={user.username.charAt(0).toUpperCase()}
                  size="xl"
                  className="border-4 border-card shadow-xl ring-2 ring-background/50"
                />
                
                <button
                  onClick={() => handleAvatarChange()}
                  className="absolute bottom-2 right-2 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all duration-200 shadow-lg ring-2 ring-background"
                >
                <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>

            {/* User Details */}
            <div className="space-y-5 sm:space-y-6">
              {/* Name and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1.5 sm:mb-2 truncate">
                    {user.username}
                  </h1>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-muted-foreground">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                      <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                      <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span>Joined {formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-0">
                  <Button
                    onClick={handleUsernameChange}
                    disabled={changeUsernameMutation.isPending}
                    variant="outline"
                    size="sm"
                    className="min-w-0 text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3"
                  >
                    {changeUsernameMutation.isPending ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      'New Username'
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="min-w-0 text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3"
                    onClick={() => navigate('/settings')}
                  >
                    <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    <span className="hidden xs:inline">Settings</span>
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 py-6 border-t border-border">
                <div className="text-center p-3 sm:p-4 rounded-lg bg-muted/50">
                  <div className="text-xl sm:text-2xl font-bold text-foreground mb-0.5 sm:mb-1">
                    {postsData?.pages[0]?.totalDocs || 0}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium">Posts</div>
                </div>
                <div className="text-center p-3 sm:p-4 rounded-lg bg-muted/50">
                  <div className="text-xl sm:text-2xl font-bold text-foreground mb-0.5 sm:mb-1">
                    {archivedData?.pages[0]?.totalDocs || 0}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium">Archived</div>
                </div>
                <div className="text-center p-3 sm:p-4 rounded-lg bg-muted/50">
                  <div className="text-xl sm:text-2xl font-bold text-foreground mb-0.5 sm:mb-1">0</div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium">Likes</div>
                </div>
                <div className="text-center p-3 sm:p-4 rounded-lg bg-muted/50">
                  <div className="text-xl sm:text-2xl font-bold text-foreground mb-0.5 sm:mb-1">0</div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium">Comments</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-card rounded-xl border border-border">
          <div className="border-b border-border px-0 sm:px-6 overflow-x-auto no-scrollbar">
            <nav className="flex whitespace-nowrap">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-3 sm:py-4 px-4 sm:px-4 flex-1 sm:flex-none border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 ${
                  activeTab === 'posts'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
              >
                <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Posts</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('archived')}
                className={`py-3 sm:py-4 px-4 sm:px-4 flex-1 sm:flex-none border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 ${
                  activeTab === 'archived'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
              >
                <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
                  <Archive className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Archived</span>
                  {(archivedData?.pages?.[0]?.totalDocs || 0) > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full font-medium">
                      {archivedData?.pages?.[0]?.totalDocs || 0}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`py-3 sm:py-4 px-4 sm:px-4 flex-1 sm:flex-none border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 ${
                  activeTab === 'about'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
              >
                <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
                  <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>About</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-3 sm:p-4 md:p-6">
            {activeTab === 'posts' && (
              <div>
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-foreground">My Posts</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">All your published posts</p>
                  </div>
                </div>
                <MyPostsList />
              </div>
            )}
            
            {activeTab === 'archived' && (
              <div>
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="p-1.5 sm:p-2 bg-secondary/10 rounded-lg">
                    <Archive className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-foreground">Archived Posts</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">Posts you've archived for later</p>
                  </div>
                </div>
                <ArchivedPostsList />
              </div>
            )}
            
            {activeTab === 'about' && (
              <div>
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="p-1.5 sm:p-2 bg-accent/10 rounded-lg">
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-foreground">About</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">Your account information</p>
                  </div>
                </div>
                
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-muted/50 rounded-lg p-4 sm:p-6">
                    <h3 className="text-base font-medium text-foreground mb-3 sm:mb-4">Account Details</h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 bg-card rounded-lg border border-border">
                        <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                          <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-medium text-foreground">Email</div>
                          <div className="text-xs sm:text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-full">{user?.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 bg-card rounded-lg border border-border">
                        <div className="p-1.5 sm:p-2 bg-secondary/10 rounded-lg">
                          <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-secondary" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-medium text-foreground">Member Since</div>
                          <div className="text-xs sm:text-sm text-muted-foreground">{formatDate(user?.createdAt)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 bg-card rounded-lg border border-border">
                        <div className="p-1.5 sm:p-2 bg-accent/10 rounded-lg">
                          <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-medium text-foreground">Username</div>
                          <div className="text-xs sm:text-sm text-muted-foreground">{user?.username}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default ProfilePage