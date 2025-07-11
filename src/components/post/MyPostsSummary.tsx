import React from 'react'
import { Calendar, Image, Heart, Eye } from 'lucide-react'
import { useMyPosts } from '../../hooks/usePosts'
import LoadingSpinner from '../ui/LoadingSpinner'
import { formatDate } from '../../lib/utils'
import { Link } from 'react-router-dom'

interface MyPostsSummaryProps {
  maxPosts?: number
}

const MyPostsSummary: React.FC<MyPostsSummaryProps> = ({ maxPosts = 3 }) => {
  const { data, isLoading, isError } = useMyPosts()

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
        <p>Unable to load recent posts</p>
      </div>
    )
  }

  const allPosts = data?.pages.flatMap(page => page.docs) || []
  const recentPosts = allPosts.slice(0, maxPosts)

  if (recentPosts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No posts yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Recent Posts</h3>
        {allPosts.length > maxPosts && (
          <Link 
            to="/profile" 
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            View all {allPosts.length}
          </Link>
        )}
      </div>

      <div className="space-y-3">
        {recentPosts.map((post) => (
          <div 
            key={post._id}
            className="p-4 bg-muted/50 rounded-lg border border-border hover:border-border/80 transition-colors"
          >
            <div className="flex items-start space-x-3">
              {post.images && post.images.length > 0 && (
                <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={post.images[0]} 
                    alt="Post image" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground line-clamp-2 mb-2">
                  {post.content}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                    
                    {post.images && post.images.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <Image className="h-3 w-3" />
                        <span>{post.images.length}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Heart className="h-3 w-3" />
                      <span>{post.totalLikes || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyPostsSummary
