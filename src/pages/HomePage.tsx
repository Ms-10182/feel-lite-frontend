import React, { useState, useEffect } from 'react'
import { Sparkles, Globe } from 'lucide-react'
import { useRecommendedPosts, useGlobalFeed, usePost } from '../hooks/usePosts'
import PostCard from '../components/post/PostCard'
import CreatePost from '../components/post/CreatePost'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { Button } from '../components/ui/Button'
import PostViewModal from '../components/ui/PostViewModal'

const HomePage: React.FC = () => {
  const [feedType, setFeedType] = useState<'global' | 'recommended'>('global')
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [feedChanging, setFeedChanging] = useState(false)
  
  // Get postId from URL if this is a shared post link
  const pathParts = window.location.pathname.split('/')
  const sharedPostId = pathParts[1] === 'post' ? pathParts[2] : null

  // Open shared post modal if postId is in URL
  useEffect(() => {
    if (sharedPostId) {
      setSelectedPostId(sharedPostId)
      setIsViewModalOpen(true)
    }
  }, [sharedPostId])
  
  // Handle feed type change with a smooth transition
  const handleFeedChange = (newFeedType: 'global' | 'recommended') => {
    if (newFeedType === feedType) return;
    
    setFeedChanging(true);
    setFeedType(newFeedType);
    
    // Refresh data when switching feeds
    if (newFeedType === 'recommended') {
      refetchRecommended();
    } else {
      refetchGlobal();
    }
    
    // Reset the transition state after animation completes
    setTimeout(() => {
      setFeedChanging(false);
    }, 300);
  }
  
  // Fetch recommended posts
  const { 
    data: recommendedData, 
    fetchNextPage: fetchNextRecommendedPage,
    hasNextPage: hasNextRecommendedPage,
    isFetchingNextPage: isLoadingMoreRecommended,
    isLoading: isRecommendedLoading, 
    error: recommendedError,
    isError: isRecommendedError,
    refetch: refetchRecommended
  } = useRecommendedPosts()
  
  // Fetch global feed posts
  const {
    data: globalFeedData,
    fetchNextPage: fetchNextGlobalPage,
    hasNextPage: hasNextGlobalPage,
    isFetchingNextPage: isLoadingMoreGlobal,
    isLoading: isGlobalLoading,
    error: globalError,
    isError: isGlobalError,
    refetch: refetchGlobal
  } = useGlobalFeed()
  
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
    // If this is a shared post URL, navigate back to home
    if (window.location.pathname.startsWith('/post/')) {
      window.history.pushState({}, '', '/')
    }
    
    setIsViewModalOpen(false)
    // Wait for modal animation to complete before clearing post data
    setTimeout(() => setSelectedPostId(null), 300)
  }

  // Loading state - only show during initial load
  const isLoading = feedType === 'global' ? isGlobalLoading : isRecommendedLoading;
  const error = feedType === 'global' ? globalError : recommendedError;
  const isError = feedType === 'global' ? isGlobalError : isRecommendedError;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Failed to load posts. Please try again.</p>
        <Button 
          onClick={() => feedType === 'global' ? refetchGlobal() : refetchRecommended()}
          variant="outline"
        >
          Retry
        </Button>
      </div>
    )
  }
  
  // Global feed posts
  const globalPosts = globalFeedData?.pages.flatMap(page => page.docs) || [];
  
  // Recommended feed posts
  const recommendedPosts = recommendedData?.pages.flatMap(page => page.docs) || [];
  
  // Get preferredTags from the first page if available
  const preferredTags = recommendedData?.pages[0]?.preferredTags || [];
  
  // Get data for current feed type
  const currentFeedPosts = feedType === 'global' ? globalPosts : recommendedPosts;
  const hasNextPage = feedType === 'global' ? hasNextGlobalPage : hasNextRecommendedPage;
  const fetchNextPage = feedType === 'global' ? fetchNextGlobalPage : fetchNextRecommendedPage;
  const isLoadingMore = feedType === 'global' ? isLoadingMoreGlobal : isLoadingMoreRecommended;

  return (
    <div className="space-y-6">
      {/* Create Post */}
      <CreatePost />
      
      {/* Feed Header */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <h2 className="text-xl font-bold text-card-foreground mb-4">
          {feedType === 'global' ? (
            <div className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Global Feed
            </div>
          ) : (
            <div className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2" />
              For You
            </div>
          )}
        </h2>
        
        <p className="text-muted-foreground mb-4">
          {feedType === 'global' 
            ? 'Discover trending posts from the entire community.'
            : 'Posts tailored to your interests and activity.'}
        </p>
        
        {/* Feed Type Toggle */}
        <div className="flex items-center justify-center space-x-4 mt-2">
          <Button
            variant={feedType === 'global' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFeedChange('global')}
            className="px-4 w-32"
          >
            <Globe className="h-4 w-4 mr-2" />
            Global
          </Button>
          <Button
            variant={feedType === 'recommended' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFeedChange('recommended')}
            className="px-4 w-32"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            For You
          </Button>
        </div>
      </div>

      {/* Preferred Tags - only show when in recommended view */}
      {feedType === 'recommended' && preferredTags.length > 0 && (
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">Your Interests</h2>
          <div className="flex flex-wrap gap-2">
            {preferredTags.map((tag) => (
              <span
                key={tag.tag}
                className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
              >
                #{tag.tag}
                <span className="ml-2 text-primary/70">({tag.count})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Posts Feed */}
      <div className={`space-y-6 transition-opacity duration-300 ${feedChanging ? 'opacity-50' : 'opacity-100'}`}>
        {currentFeedPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {feedType === 'global' 
                ? 'No posts to show in the global feed.'
                : 'No recommended posts to show. Start following some hashtags or create your first post!'}
            </p>
          </div>
        ) : (
          <>
            {currentFeedPosts.map((post) => (
              <PostCard 
                key={post._id} 
                post={post} 
                onViewPost={handleViewPost} 
              />
            ))}
            
            {/* Load More Button */}
            {hasNextPage && (
              <div className="flex justify-center pt-6">
                <Button
                  onClick={() => fetchNextPage()}
                  disabled={isLoadingMore}
                  variant="outline"
                  className="px-8"
                >
                  {isLoadingMore ? (
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
          </>
        )}
      </div>
      
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

export default HomePage