import React from 'react'
import { useThreads, useCreateThread } from '../../hooks/useComments'
import ThreadItem from './ThreadItem'
import CommentForm from './CommentForm'
import LoadingSpinner from '../ui/LoadingSpinner'

interface ThreadSectionProps {
  commentId: string
  postOwnerId?: string
}

const ThreadSection: React.FC<ThreadSectionProps> = ({ commentId, postOwnerId }) => {
  const { data: threads, isLoading } = useThreads(commentId)
  const createThreadMutation = useCreateThread()



  const handleCreateThread = async (content: string) => {
    try {
      await createThreadMutation.mutateAsync({
        commentId,
        data: { content },
      })
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-2">
        <LoadingSpinner size="sm" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Thread Form */}
      <CommentForm 
        onSubmit={handleCreateThread}
        isSubmitting={createThreadMutation.isPending}
        placeholder="Write a reply..."
      />

      {/* Threads List */}
      <div className="space-y-3">
        {threads && Array.isArray(threads) && threads.length > 0 ? (
          threads.map((thread) => (
            <ThreadItem 
              key={thread._id} 
              thread={thread} 
              postOwnerId={postOwnerId}
            />
          ))
        ) : (
          <p className="text-muted-foreground text-xs text-center py-2">
            No replies yet.
          </p>
        )}
      </div>
    </div>
  )
}

export default ThreadSection