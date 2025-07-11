import React, { useState } from 'react'
import { Heart, Calendar, X, Eye, Bookmark, Image as ImageIcon, User } from 'lucide-react'
import { formatDate } from '../../lib/utils'
import { usePost } from '../../hooks/usePosts'
import PostViewModal from '../ui/PostViewModal'
import Avatar from '../ui/Avatar'
import type { LikedPost } from '../../types'

interface MinimalPostData {
  postId: string
  content: string
  createdAt: string
  updatedAt?: string
  images?: string[]
  totalLikes?: number
  isLiked?: boolean
  owner?: {
    _id?: string
    username?: string
    avatar?: string
  }
}

interface MinimalPostCardProps {
  post: MinimalPostData
  type: 'liked' | 'bookmarked'
  onRemove?: (postId: string) => void
  isRemoving?: boolean
}

const MinimalPostCard: React.FC<MinimalPostCardProps> = ({ 
  post, 
  type, 
  onRemove,
  isRemoving = false 
}) => {
  const [showModal, setShowModal] = useState(false)
  const { data: fullPost, isLoading, error } = usePost(showModal ? post.postId : null)

  const handleViewPost = () => {
    setShowModal(true)
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onRemove) {
      onRemove(post.postId)
    }
  }

  const getIcon = () => {
    if (type === 'liked') {
      return <Heart className="h-5 w-5 text-red-500 fill-current" />
    }
    return <Bookmark className="h-5 w-5 text-amber-500 fill-current" />
  }

  const getTypeText = () => {
    return type === 'liked' ? 'Liked' : 'Bookmarked'
  }

  const hasImage = post.images && post.images.length > 0
  const hasOwner = post.owner && post.owner.username

  return (
    <>
      <div className="bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition-all duration-200 overflow-hidden group">
        {/* Header with owner info if available */}
        {hasOwner && (
          <div className="px-6 pt-5 pb-3 border-b border-border/40 flex items-center">
            <Avatar 
              src={post.owner?.avatar || ''} 
              alt={post.owner?.username || 'User'} 
              fallback={(post.owner?.username || 'U').charAt(0)} 
              size="sm" 
              className="mr-3" 
            />
            <span className="text-sm font-medium">{post.owner?.username}</span>
          </div>
        )}
        
        <div className="p-6 pt-5 relative">
          {/* Remove button */}
          {onRemove && (
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className="absolute top-4 right-4 p-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 disabled:opacity-50 z-10"
              title={`Remove from ${type} posts`}
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Content section */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Text Content */}
            <div className="flex-1 mb-4 sm:mb-0 pr-8">
              <p className="text-foreground whitespace-pre-wrap leading-relaxed line-clamp-3">
                {post.content}
              </p>
            </div>
            
            {/* Image thumbnail (if available) */}
            {hasImage && (
              <div className="flex-shrink-0 w-full sm:w-1/4 max-w-[180px]">
                <div className="relative rounded-lg overflow-hidden aspect-square bg-muted">
                  <img 
                    src={post.images![0]} 
                    alt="Post thumbnail" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
              {hasImage && (
                <div className="flex items-center space-x-1">
                  <ImageIcon className="h-4 w-4" />
                  <span>{post.images!.length > 1 ? `${post.images!.length} images` : '1 image'}</span>
                </div>
              )}
              {post.totalLikes !== undefined && (
                <div className="flex items-center space-x-1">
                  <Heart className={`h-4 w-4 ${post.isLiked ? 'text-red-500 fill-current' : ''}`} />
                  <span>{post.totalLikes}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {getIcon()}
                <span className="text-sm text-muted-foreground">{getTypeText()}</span>
              </div>
              
              <button
                onClick={handleViewPost}
                className="flex items-center space-x-1 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors text-sm font-medium"
              >
                <Eye className="h-4 w-4" />
                <span>View</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Post View Modal */}
      <PostViewModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        post={fullPost || null}
        isLoading={isLoading}
        error={error}
      />
    </>
  )
}

export default MinimalPostCard
