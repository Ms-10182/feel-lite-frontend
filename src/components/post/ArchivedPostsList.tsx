import React, { useState, useMemo } from 'react'
import { Archive, Search, ArchiveRestore, Trash2, ChevronDown, Filter, Check, Eye } from 'lucide-react'
import { useArchivedPosts, useArchivePost, useBulkUnarchivePosts, usePost } from '../../hooks/usePosts'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import LoadingSpinner from '../ui/LoadingSpinner'
import PostViewModal from '../ui/PostViewModal'
import { formatDate } from '../../lib/utils'

const ArchivedPostsList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
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
  } = useArchivedPosts()

  const archivePostMutation = useArchivePost()
  const bulkUnarchiveMutation = useBulkUnarchivePosts()

  // Get the selected post details
  const {
    data: selectedPost,
    isLoading: isPostLoading,
    error: postError
  } = usePost(selectedPostId)

  // Get all posts from all pages
  const allPosts = data?.pages.flatMap(page => page.docs) || []
  const firstPage = data?.pages[0]
  const totalPosts = firstPage?.totalDocs || 0

  // Extract unique tags from all posts for filtering
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>()
    allPosts.forEach(post => {
      post.tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [allPosts])

  // Filter posts based on search and tags
  const filteredPosts = useMemo(() => {
    return allPosts.filter(post => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesContent = post.content.toLowerCase().includes(query)
        const matchesTags = post.tags.some(tag => tag.toLowerCase().includes(query))
        if (!matchesContent && !matchesTags) return false
      }

      // Tags filter
      if (selectedTags.length > 0) {
        const hasSelectedTag = selectedTags.some(tag => post.tags.includes(tag))
        if (!hasSelectedTag) return false
      }

      return true
    })
  }, [allPosts, searchQuery, selectedTags])

  // Handle individual post unarchive
  const handleUnarchivePost = async (postId: string) => {
    try {
      await archivePostMutation.mutateAsync({ postId, archive: false })
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  // Handle bulk unarchive
  const handleBulkUnarchive = async () => {
    if (selectedPosts.length === 0) return

    try {
      await bulkUnarchiveMutation.mutateAsync(selectedPosts)
      setSelectedPosts([])
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  // Toggle post selection
  const togglePostSelection = (postId: string) => {
    setSelectedPosts(prev => 
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    )
  }

  // Select all filtered posts
  const selectAllPosts = () => {
    if (selectedPosts.length === filteredPosts.length) {
      setSelectedPosts([])
    } else {
      setSelectedPosts(filteredPosts.map(post => post._id))
    }
  }

  // Toggle tag filter
  const toggleTagFilter = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  // Handle view post
  const handleViewPost = (postId: string) => {
    setSelectedPostId(postId)
    setIsViewModalOpen(true)
  }
  
  // Handle close modal
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
    const errorMessage = (error as any)?.response?.data?.message || 'Failed to load archived posts'
    const isNoPostsError = (error as any)?.response?.status === 404
    
    if (isNoPostsError) {
      return (
        <div className="text-center py-12 space-y-4">
          <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
            <Archive className="h-12 w-12 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No archived posts</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              You haven't archived any posts yet. Archive posts to store them here for later reference.
            </p>
          </div>
        </div>
      )
    }
    
    // Handle other (non-404) errors
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-24 h-24 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
          <Archive className="h-12 w-12 text-destructive" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Error loading archived posts</h3>
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

  // Empty state (when API returns empty data but no error)
  if (allPosts.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
          <Archive className="h-12 w-12 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No archived posts</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            You haven't archived any posts yet. Archive posts to store them here for later reference.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Bulk Actions */}
        {selectedPosts.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <span className="text-sm font-medium text-primary">
              {selectedPosts.length} post{selectedPosts.length > 1 ? 's' : ''} selected
            </span>
            <Button
              onClick={handleBulkUnarchive}
              disabled={bulkUnarchiveMutation.isPending}
              size="sm"
              variant="outline"
            >
              {bulkUnarchiveMutation.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <ArchiveRestore className="h-4 w-4 mr-2" />
                  Unarchive Selected
                </>
              )}
            </Button>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search archived posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
              className={showFilters ? 'bg-muted' : ''}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              <ChevronDown 
                className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} 
              />
            </Button>

            {allPosts.length > 0 && (
              <Button
                onClick={selectAllPosts}
                variant="outline"
                size="sm"
              >
                <Check className="h-4 w-4 mr-2" />
                {selectedPosts.length === filteredPosts.length ? 'Deselect All' : 'Select All'}
              </Button>
            )}
          </div>
        </div>

        {/* Tag Filters */}
        {showFilters && availableTags.length > 0 && (
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <h4 className="text-sm font-medium text-foreground mb-3">Filter by tags:</h4>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTagFilter(tag)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border hover:border-border/80'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <Button
                onClick={() => setSelectedTags([])}
                variant="ghost"
                size="sm"
                className="mt-2"
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* No results after filtering */}
      {filteredPosts.length === 0 && allPosts.length > 0 && (
        <div className="text-center py-8 space-y-4">
          <Search className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No posts found</h3>
            <p className="text-muted-foreground">
              No archived posts match your search criteria.
            </p>
          </div>
          <Button
            onClick={() => {
              setSearchQuery('')
              setSelectedTags([])
            }}
            variant="outline"
          >
            Clear filters
          </Button>
        </div>
      )}

      {/* Posts List */}
      {filteredPosts.length > 0 && (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div key={post._id} className="relative">
              {/* Selection Checkbox */}
              <button
                onClick={() => togglePostSelection(post._id)}
                className={`absolute top-4 left-4 z-10 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  selectedPosts.includes(post._id)
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-background border-border hover:border-primary'
                }`}
              >
                {selectedPosts.includes(post._id) && (
                  <Check className="h-3 w-3" />
                )}
              </button>

              {/* Archived Post Card */}
              <div className={`bg-card rounded-xl p-6 shadow-sm border border-border transition-all ${
                selectedPosts.includes(post._id) ? 'ring-2 ring-primary' : ''
              }`}>
                {/* Post Header */}
                <div className="flex items-start space-x-3 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-foreground">{post.owner.username}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</span>
                      <div className="flex items-center space-x-1 px-2 py-1 bg-muted rounded-full">
                        <Archive className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Archived</span>
                      </div>
                    </div>
                  </div>

                  {/* Unarchive Button */}
                  <Button
                    onClick={() => handleUnarchivePost(post._id)}
                    disabled={archivePostMutation.isPending}
                    variant="outline"
                    size="sm"
                  >
                    {archivePostMutation.isPending ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <ArchiveRestore className="h-4 w-4 mr-2" />
                        Unarchive
                      </>
                    )}
                  </Button>
                </div>

                {/* Post Content */}
                <div 
                  className="space-y-4 cursor-pointer" 
                  onClick={() => handleViewPost(post._id)}
                >
                  <p className="text-foreground whitespace-pre-wrap">{post.content}</p>

                  {/* Images */}
                  {post.images && post.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {post.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Post image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
      {!hasNextPage && filteredPosts.length > 5 && (
        <div className="text-center pt-6">
          <p className="text-sm text-muted-foreground">
            You've reached the end of your archived posts
          </p>
        </div>
      )}

      {/* Post View Modal */}
      {selectedPostId && isViewModalOpen && (
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

export default ArchivedPostsList
