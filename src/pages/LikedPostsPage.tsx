import React from 'react'
import { Heart } from 'lucide-react'
import { useLikedPosts, useRemoveLikedPost } from '../hooks/useLikes'
import MinimalPostCard from '../components/post/MinimalPostCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const LikedPostsPage: React.FC = () => {
  const { data: likedPosts, isLoading, error, refetch } = useLikedPosts()
  const removeLikedPostMutation = useRemoveLikedPost()

  const handleRemoveLikedPost = async (postId: string) => {
    try {
      await removeLikedPostMutation.mutateAsync(postId)
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    const errorMessage = (error as any)?.response?.data?.message || 'Failed to load liked posts'
    const isNoLikedPostsError = (error as any)?.response?.status === 404
    
    if (isNoLikedPostsError) {
      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h1 className="text-2xl font-bold text-foreground flex items-center">
              <Heart className="h-6 w-6 mr-3 text-error" />
              Liked Posts
            </h1>
            <p className="text-muted-foreground mt-2">
              Posts you've liked will appear here
            </p>
          </div>

          {/* Empty state */}
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
              <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No liked posts yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Start exploring and like posts to see them here!
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h1 className="text-2xl font-bold text-foreground flex items-center">
            <Heart className="h-6 w-6 mr-3 text-error" />
            Liked Posts
          </h1>
          <p className="text-muted-foreground mt-2">
            Posts you've liked will appear here
          </p>
        </div>

        {/* Error state */}
        <div className="text-center py-12 space-y-4">
          <div className="w-24 h-24 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
            <Heart className="h-12 w-12 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Error loading liked posts</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-4">
              {errorMessage}
            </p>
            <button 
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <h1 className="text-2xl font-bold text-foreground flex items-center">
          <Heart className="h-6 w-6 mr-3 text-error" />
          Liked Posts
        </h1>
        <p className="text-muted-foreground mt-2">
          {likedPosts && likedPosts.length > 0 
            ? `${likedPosts.length} post${likedPosts.length === 1 ? '' : 's'} you've liked`
            : 'Posts you\'ve liked will appear here'
          }
        </p>
      </div>

      {/* Posts */}
      <div className="space-y-6">
        {likedPosts && likedPosts.length > 0 ? (
          likedPosts.map((likedPost, index) => (
            <div key={likedPost.postId} className="relative">
              <MinimalPostCard 
                post={likedPost} 
                type="liked"
                onRemove={handleRemoveLikedPost}
                isRemoving={removeLikedPostMutation.isPending}
              />
              {/* Subtle separator line for better visual separation */}
              {index < likedPosts.length - 1 && (
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent opacity-40" />
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
              <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No liked posts yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Start exploring and like posts to see them here!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default LikedPostsPage