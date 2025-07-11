import React from 'react'
import { Archive, Calendar, ArchiveRestore } from 'lucide-react'
import { useArchivedPosts, useArchivePost } from '../../hooks/usePosts'
import { Button } from '../ui/Button'
import LoadingSpinner from '../ui/LoadingSpinner'
import { formatDate } from '../../lib/utils'
import { Link } from 'react-router-dom'

interface ArchivedPostsSummaryProps {
  maxPosts?: number
}

const ArchivedPostsSummary: React.FC<ArchivedPostsSummaryProps> = ({ maxPosts = 3 }) => {
  const { data, isLoading, isError } = useArchivedPosts()
  const archivePostMutation = useArchivePost()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="md" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Unable to load archived posts</p>
      </div>
    )
  }

  const allPosts = data?.pages.flatMap(page => page.docs) || []
  const recentPosts = allPosts.slice(0, maxPosts)
  const totalArchived = data?.pages?.[0]?.totalDocs || 0

  if (recentPosts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Archive className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No archived posts</p>
      </div>
    )
  }

  const handleUnarchivePost = async (postId: string) => {
    try {
      await archivePostMutation.mutateAsync({ postId, archive: false })
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Archived Posts</h3>
        {totalArchived > maxPosts && (
          <Link 
            to="/profile" 
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            View all {totalArchived}
          </Link>
        )}
      </div>

      <div className="space-y-3">
        {recentPosts.map((post) => (
          <div 
            key={post._id}
            className="p-4 bg-muted/50 rounded-lg border border-border hover:border-border/80 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <Archive className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Archived on {formatDate(post.createdAt)}
                  </span>
                </div>
                
                <p className="text-sm text-foreground line-clamp-2 mb-2">
                  {post.content}
                </p>
                
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs bg-background text-muted-foreground rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{post.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <Button
                onClick={() => handleUnarchivePost(post._id)}
                disabled={archivePostMutation.isPending}
                variant="ghost"
                size="sm"
                className="flex-shrink-0 ml-3"
              >
                {archivePostMutation.isPending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <ArchiveRestore className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {totalArchived === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Archive posts to access them later
          </p>
        </div>
      )}
    </div>
  )
}

export default ArchivedPostsSummary
