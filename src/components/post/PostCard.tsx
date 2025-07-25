import React, { useState, useEffect } from 'react'
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Edit, Trash2, Archive, Share2 } from 'lucide-react'
import { useTogglePostLike } from '../../hooks/useLikes'
import { useAuth } from '../../contexts/AuthContext'
import { formatDate, processHashtags } from '../../lib/utils'
import { Button } from '../ui/Button'
import Avatar from '../ui/Avatar'
import ImageGallery from './ImageGallery'
import CommentSection from '../comment/CommentSection'
import PostActions from './PostActions'
import BookmarkModal from '../ui/BookmarkModal'
import ShareModal from '../ui/ShareModal'
import SimpleEditPostModal from './SimpleEditPostModal'
import type { Post } from '../../types'

interface PostCardProps {
  post: Post
  onViewPost?: (postId: string) => void
}

const PostCard: React.FC<PostCardProps> = ({ post, onViewPost }) => {
  const { user } = useAuth()
  const [showComments, setShowComments] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [showBookmarkModal, setShowBookmarkModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [likeCount, setLikeCount] = useState(post.totalLikes || 0)
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked)
  const [showEditModal, setShowEditModal] = useState(false)
  
  const toggleLikeMutation = useTogglePostLike()

  const isOwner = user?._id === post.owner._id

  // Sync local state with post data when post changes
  useEffect(() => {
    setIsLiked(post.isLiked)
    setLikeCount(post.totalLikes || 0)
    setIsBookmarked(post.isBookmarked)
  }, [post.isLiked, post.totalLikes, post.isBookmarked])

  const handleLike = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? Math.max(0, prev - 1) : prev + 1);
    try {
      await toggleLikeMutation.mutateAsync(post._id);
      console.log(`Successfully toggled like for post ${post._id}. New state: ${!isLiked}`);
    } catch (error) {
      console.error('Error toggling like:', error);
      setIsLiked(isLiked);
      setLikeCount(post.totalLikes || 0);
    }
  }

  const handleBookmark = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setShowBookmarkModal(true)
  }
  
  const handleShare = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setShowShareModal(true)
  }

  const handleViewPost = () => {
    if (onViewPost) {
      onViewPost(post._id)
    }
  }

  return (
    <div className="post-card-shadow hover:post-card-shadow-hover bg-card rounded-2xl border border-border/60 overflow-hidden transition-all duration-300 hover:border-border hover:scale-[1.01] hover:bg-card/90">
      {/* Header */}
      <div className="p-4 sm:p-6 pb-3 sm:pb-4 post-gradient-header border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar
              src={post.owner.avatar}
              alt={post.owner.username}
              fallback={post.owner.username.charAt(0)}
              size="md"
              className="ring-2 ring-background shadow-sm"
            />
            <div>
              <h3 className="font-semibold text-card-foreground">{post.owner.username}</h3>
              <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
            </div>
          </div>
          
          {isOwner && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActions(!showActions);
                  console.log('More button clicked, showActions:', !showActions);
                }}
                className="h-8 w-8 hover:bg-muted/50"
                data-testid="post-more-button"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              {showActions && (
                <PostActions
                  post={post}
                  onClose={() => {
                    console.log('Closing actions menu');
                    setShowActions(false);
                  }}
                  onEdit={() => {
                    setShowEditModal(true);
                    setShowActions(false);
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
      {/* Content */}
      <div 
        className="px-4 sm:px-6 py-4 sm:py-5 post-gradient-bg cursor-pointer"
        onClick={() => onViewPost && onViewPost(post._id)}
      >
        <div 
          className="text-card-foreground leading-relaxed text-sm sm:text-base"
          dangerouslySetInnerHTML={{ __html: processHashtags(post.content) }}
        />
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-block px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `/hashtag/${tag}`;
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
      {/* Images */}
      {post.images.length > 0 && (
        <div onClick={() => onViewPost && onViewPost(post._id)} className="cursor-pointer">
          <ImageGallery images={post.images} />
        </div>
      )}
      {/* Actions */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border/60 post-gradient-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
              disabled={toggleLikeMutation.isPending}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              <span className="text-sm">{likeCount || 0}</span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border hover:border-primary/20 hover:shadow-sm transition-all duration-200 px-3 py-2 rounded-xl font-medium"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm">Comment</span>
            </button>
            <button
              onClick={(e) => handleShare(e)}
              className="flex items-center space-x-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-50 hover:border hover:border-blue-200 hover:shadow-sm transition-all duration-200 px-3 py-2 rounded-xl font-medium"
            >
              <Share2 className="h-5 w-5" />
              <span className="text-sm">Share</span>
            </button>
          </div>
          <button
            onClick={(e) => handleBookmark(e)}
            className={`transition-all duration-200 p-2 rounded-xl ${
              isBookmarked 
                ? 'text-amber-500 bg-amber-50 border border-amber-200 shadow-glow-amber' 
                : 'text-muted-foreground hover:text-amber-500 hover:bg-amber-50 hover:border hover:border-amber-200 hover:shadow-sm'
            }`}
          >
            <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
          </button>
        </div>
      </div>
      {/* Comments */}
      {showComments && (
        <div className="border-t border-border">
          <CommentSection 
            postId={post._id} 
            postOwnerId={post.owner._id}
          />
        </div>
      )}
      {/* Bookmark Modal */}
      <BookmarkModal 
        isOpen={showBookmarkModal} 
        onClose={() => setShowBookmarkModal(false)} 
        post={post}
        onBookmarkToggle={() => setIsBookmarked(true)}
      />
      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        postId={post._id}
      />
      {/* Edit Post Modal (always rendered at root of PostCard) */}
      <SimpleEditPostModal
        post={post}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
    </div>
  )
}

export default PostCard