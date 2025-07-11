import React, { useState } from 'react'
import { Calendar, Image, Tag, MoreHorizontal } from 'lucide-react'
import { useMyPosts, usePost } from '../../hooks/usePosts'
import { Button } from '../ui/Button'
import LoadingSpinner from '../ui/LoadingSpinner'
import PostCard from '../post/PostCard'
import PostViewModal from '../ui/PostViewModal'
import { formatDate } from '../../lib/utils'

const MyPostsList: React.FC = () => {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useMyPosts()
  
  // Fetch selected post details when viewing in modal
  const { 
    data: selectedPost, 
    isLoading: isPostLoading,
    error: postError
  } = usePost(selectedPostId)
  
  const handleViewPost = (postId: string) => {
    setSelectedPostId(postId)
    setIsViewModalOpen(true)
  }
  
  const handleCloseModal = () => {
    setIsViewModalOpen(false)
    // Wait for modal animation to complete before clearing post data
    setTimeout(() => setSelectedPostId(null), 300)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Error state
  if (isError) {
    const errorMessage = (error as any)?.response?.data?.message || 'Failed to load your posts'
    const isNoPostsError = (error as any)?.response?.status === 404
    
    if (isNoPostsError) {
      return (
        <div className="text-center py-12 space-y-4">
          <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
            <Image className="h-12 w-12 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No posts yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              You haven't created any posts yet. Start sharing your thoughts and experiences!
            </p>
          </div>
          <Button 
            onClick={() => window.location.href = '/'}
            className="mt-4"
          >
            Create Your First Post
          </Button>
        </div>
      )
    }

    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-24 h-24 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
          <MoreHorizontal className="h-12 w-12 text-destructive" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Error loading posts</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-4">
            {errorMessage}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Get all posts from all pages
  const allPosts = data?.pages.flatMap(page => page.docs) || []
  const firstPage = data?.pages[0]
  const totalPosts = firstPage?.totalDocs || 0

  // Empty state (when API returns empty data but no error)
  if (allPosts.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
          <Image className="h-12 w-12 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No posts yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            You haven't created any posts yet. Start sharing your thoughts and experiences!
          </p>
        </div>
        <Button 
          onClick={() => window.location.href = '/'}
          className="mt-4"
        >
          Create Your First Post
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Posts List */}
      <div className="space-y-6">
        {allPosts.map((post, index) => (
          <div key={post._id} className="relative">
            <PostCard post={post} onViewPost={handleViewPost} />
            {/* Subtle separator line for better visual separation */}
            {index < allPosts.length - 1 && (
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent opacity-40" />
            )}
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasNextPage && (
        <div className="flex justify-center pt-6">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            variant="outline"
            className="px-8"
          >
            {isFetchingNextPage ? (
              <div className="flex items-center space-x-2">
                <LoadingSpinner size="sm" />
                <span>Loading more...</span>
              </div>
            ) : (
              'Load More Posts'
            )}
          </Button>
        </div>
      )}

      {/* End of Posts Indicator */}
      {!hasNextPage && allPosts.length > 5 && (
        <div className="text-center pt-6">
          <p className="text-sm text-muted-foreground">
            You've reached the end of your posts
          </p>
        </div>
      )}
      
      {/* Post View Modal */}
      {isViewModalOpen && (
        <PostViewModal 
          isOpen={isViewModalOpen}
          onClose={handleCloseModal}
          post={selectedPost || null}
          isLoading={isPostLoading}
          error={postError}
        />
      )}
    </div>
  )
}

export default MyPostsList
