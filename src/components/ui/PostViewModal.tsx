import React from 'react'
import { X } from 'lucide-react'
import Modal from './Modal'
import PostCard from '../post/PostCard'
import LoadingSpinner from './LoadingSpinner'
import type { Post } from '../../types'

interface PostViewModalProps {
  isOpen: boolean
  onClose: () => void
  post: Post | null
  isLoading?: boolean
  error?: any
}

const PostViewModal: React.FC<PostViewModalProps> = ({
  isOpen,
  onClose,
  post,
  isLoading = false,
  error = null
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="relative bg-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-card/80 backdrop-blur-sm border border-border rounded-full hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="overflow-y-auto max-h-[90vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12 px-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load post</h3>
              <p className="text-muted-foreground">
                {error?.response?.data?.message || 'Unable to fetch post details'}
              </p>
            </div>
          ) : post ? (
            <div className="p-0">
              <PostCard post={post} />
            </div>
          ) : (
            <div className="text-center py-12 px-6">
              <p className="text-muted-foreground">No post data available</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default PostViewModal
