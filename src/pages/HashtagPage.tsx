import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Hash, ArrowLeft } from 'lucide-react'
import { useHashtagPosts, usePost } from '../hooks/usePosts'
import { useTrendingPosts } from '../hooks/useTrendingPosts'
import PostCard from '../components/post/PostCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { Button } from '../components/ui/Button'
import PostViewModal from '../components/ui/PostViewModal'
import HashtagSearch from '../components/search/HashtagSearch'

interface HashtagPageProps {
  trendingMode?: boolean
}

const HashtagPage: React.FC<HashtagPageProps> = ({ trendingMode }) => {
  const { tag } = useParams<{ tag: string }>()
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  // Use trending API if trendingMode, else use hashtag API
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    isError,
  } = trendingMode
    ? useTrendingPosts()
    : useHashtagPosts(tag || '')

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

  // Show search interface if no tag is provided and not trending
  if (!trendingMode && !tag) {
    return (
      <div className="space-y-6">
        {/* Back to Home */}
        <div className="flex items-center">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Search Interface */}
        <HashtagSearch />

        {/* Popular Hashtags */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Popular Hashtags</h3>
          <div className="flex flex-wrap gap-2">
            {['ai', 'blockchain', 'react', 'javascript', 'web3', 'ml', 'programming', 'tech'].map((popularTag) => (
              <Link key={popularTag} to={`/hashtag/${popularTag}`}>
                <Button variant="outline" size="sm" className="text-sm">
                  #{popularTag}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Back Navigation */}
        <div className="flex items-center">
          <Link to="/hashtag">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Failed to load posts for #{tag}. Please try again.</p>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline"
        >
          Retry
        </Button>
      </div>
    )
  }

  const posts = data?.pages.flatMap(page => page.docs) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <h1 className="text-2xl font-bold text-card-foreground flex items-center">
          <Hash className="h-6 w-6 mr-3 text-primary" />
          {trendingMode ? 'Trending' : tag}
        </h1>
        <p className="text-muted-foreground mt-2">
          {data?.pages[0]?.totalDocs || 0} {(data?.pages[0]?.totalDocs || 0) === 1 ? 'post' : 'posts'} found
        </p>
      </div>

      {/* Posts */}
      <div className="space-y-6">
        {posts.length > 0 ? (
          <>
            {posts.map((post) => (
              <PostCard 
                key={post._id} 
                post={post} 
                onViewPost={handleViewPost}
              />
            ))}
            
            {hasNextPage && (
              <div className="flex justify-center pt-6">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
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
          </>
        ) : (
          <div className="text-center py-12">
            <Hash className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">No posts found for #{tag}</p>
            <p className="text-muted-foreground/70 text-sm">
              Be the first to post with this hashtag!
            </p>
          </div>
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

export default HashtagPage