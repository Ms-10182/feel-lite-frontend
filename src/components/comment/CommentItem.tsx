import React, { useState, useEffect, useRef } from 'react'
import { Heart, MessageCircle, MoreHorizontal, Edit2, Trash2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToggleCommentLike } from '../../hooks/useLikes'
import { useThreads, useUpdateComment, useDeleteComment } from '../../hooks/useComments'
import { formatDate } from '../../lib/utils'
import Avatar from '../ui/Avatar'
import { Button } from '../ui/Button'
import Modal from '../ui/Modal'
import { Textarea } from '../ui/Textarea'
import ThreadSection from './ThreadSection'
import type { Comment } from '../../types'

interface CommentItemProps {
  comment: Comment
  postOwnerId?: string
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, postOwnerId }) => {
  const { user } = useAuth()
  const [showThreads, setShowThreads] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isLiked, setIsLiked] = useState(comment.isLiked || false)
  const [likeCount, setLikeCount] = useState(comment.totalLikes || 0)
  const actionsRef = useRef<HTMLDivElement>(null)
  
  const toggleLikeMutation = useToggleCommentLike()
  const updateCommentMutation = useUpdateComment()
  const deleteCommentMutation = useDeleteComment()
  const { data: threads } = useThreads(comment._id)

  // Debug logging


  const isOwner = user?._id === comment.owner._id
  const isPostOwner = postOwnerId && user?._id === postOwnerId

  // Close actions dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setShowActions(false)
      }
    }

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showActions])

  const handleLike = async () => {
    try {
      await toggleLikeMutation.mutateAsync(comment._id)
      setIsLiked(!isLiked)
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setShowActions(false)
  }

  const handleSaveEdit = async () => {
    if (editContent.trim() === comment.content) {
      setIsEditing(false)
      return
    }

    try {
      await updateCommentMutation.mutateAsync({
        commentId: comment._id,
        data: { content: editContent.trim() }
      })
      setIsEditing(false)
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const handleCancelEdit = () => {
    setEditContent(comment.content)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    try {
      await deleteCommentMutation.mutateAsync(comment._id)
      setShowDeleteModal(false)
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  return (
    <div className="border-l-2 border-border pl-4">
      <div className="flex items-start space-x-3">
        <Avatar
          src={comment.owner.avatar}
          alt={comment.owner.username}
          fallback={comment.owner.username.charAt(0)}
          size="sm"
        />
        
        <div className="flex-1 min-w-0">
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-foreground text-sm">
                {comment.owner.username}
              </h4>
              
              {(isOwner || isPostOwner) && (
                <div className="relative" ref={actionsRef}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => setShowActions(!showActions)}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                  
                  {showActions && (
                    <div className="absolute right-0 top-6 bg-card border border-border rounded-md shadow-lg z-50 min-w-[120px]">
                      {isOwner && (
                        <button
                          onClick={handleEdit}
                          className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
                        >
                          <Edit2 className="h-3 w-3" />
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setShowDeleteModal(true)
                          setShowActions(false)
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-destructive hover:bg-muted flex items-center gap-2"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Edit your comment..."
                  className="min-h-[60px] text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={updateCommentMutation.isPending || !editContent.trim()}
                  >
                    {updateCommentMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-foreground text-sm">{comment.content}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-4 mt-2">
            <span className="text-xs text-muted-foreground">
              {formatDate(comment.createdAt)}
            </span>
            
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 text-xs transition-colors ${
                isLiked 
                  ? 'text-destructive' 
                  : 'text-muted-foreground hover:text-destructive'
              }`}
              disabled={toggleLikeMutation.isPending}
            >
              <Heart className={`h-3 w-3 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likeCount}</span>
            </button>
            
            <button
              onClick={() => setShowThreads(!showThreads)}
              className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <MessageCircle className="h-3 w-3" />
              <span>Reply</span>
              {threads && threads.length > 0 && (
                <span>({threads.length})</span>
              )}
            </button>
          </div>
          
          {/* Thread Section */}
          {showThreads && (
            <div className="mt-4">
              <ThreadSection 
                commentId={comment._id} 
                postOwnerId={postOwnerId}
              />
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Comment"
      >
        <div className="space-y-4">
          <p className="text-foreground">Are you sure you want to delete this comment?</p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteCommentMutation.isPending}
            >
              {deleteCommentMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default CommentItem