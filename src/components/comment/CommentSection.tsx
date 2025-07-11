import React, { useState } from 'react'
import { useComments, useCreateComment } from '../../hooks/useComments'
import CommentItem from './CommentItem'
import CommentForm from './CommentForm'
import LoadingSpinner from '../ui/LoadingSpinner'
import { Button } from '../ui/Button'
import type { Comment } from '../../types'

interface CommentSectionProps {
  postId: string
  postOwnerId?: string
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, postOwnerId }) => {
  const [page, setPage] = useState(1)
  const { data: commentsData, isLoading } = useComments(postId, page)
  const createCommentMutation = useCreateComment()

  const handleCreateComment = async (content: string) => {
    try {
      await createCommentMutation.mutateAsync({
        postId,
        data: { content },
      })
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-4">
          <LoadingSpinner size="md" />
        </div>
      </div>
    )
  }

  const comments = commentsData?.comments || []
  const hasMore = commentsData ? commentsData.page < commentsData.totalPages : false

  return (
    <div className="p-6">
      {/* Comment Form */}
      <CommentForm 
        onSubmit={handleCreateComment}
        isSubmitting={createCommentMutation.isPending}
      />

      {/* Comments List */}
      <div className="mt-6 space-y-4">
        {comments.map((comment: Comment) => (
          <CommentItem 
            key={comment._id} 
            comment={comment} 
            postOwnerId={postOwnerId}
          />
        ))}
        
        {comments.length === 0 && (
          <p className="text-muted-foreground text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        )}
        
        {hasMore && (
          <div className="text-center pt-4">
            <Button
              variant="ghost"
              onClick={() => setPage(prev => prev + 1)}
            >
              Load more comments
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CommentSection