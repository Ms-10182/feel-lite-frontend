import React, { useRef, useEffect, useState } from 'react'
import { Edit, Trash2, Archive, ArchiveRestore } from 'lucide-react'
import { useDeletePost, useArchivePost } from '../../hooks/usePosts'
import { Button } from '../ui/Button'
import EditPostModal from './EditPostModal'
import type { Post } from '../../types'

interface PostActionsProps {
  post: Post
  onClose: () => void
}

const PostActions: React.FC<PostActionsProps> = ({ post, onClose }) => {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const deletePostMutation = useDeletePost()
  const archivePostMutation = useArchivePost()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePostMutation.mutateAsync(post._id)
        onClose()
      } catch (error) {
        // Error handling is done in the hook
      }
    }
  }

  const handleArchive = async () => {
    try {
      await archivePostMutation.mutateAsync({
        postId: post._id,
        archive: !post.isArchived,
      })
      onClose()
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const handleEdit = () => {
    setShowEditModal(true)
    onClose()
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
  }

  return (
    <>
      <div
        ref={dropdownRef}
        className="absolute right-0 top-8 w-48 bg-card rounded-lg shadow-lg border border-border py-2 z-50"
      >
        <button
          className="flex items-center space-x-3 w-full px-4 py-2 text-card-foreground hover:bg-muted transition-colors"
          onClick={handleEdit}
        >
          <Edit className="h-4 w-4" />
          <span>Edit Post</span>
        </button>
        
        <button
          className="flex items-center space-x-3 w-full px-4 py-2 text-card-foreground hover:bg-muted transition-colors"
          onClick={handleArchive}
          disabled={archivePostMutation.isPending}
        >
          {post.isArchived ? (
            <ArchiveRestore className="h-4 w-4" />
          ) : (
            <Archive className="h-4 w-4" />
          )}
          <span>{post.isArchived ? 'Unarchive' : 'Archive'}</span>
        </button>
        
        <button
          className="flex items-center space-x-3 w-full px-4 py-2 text-destructive hover:bg-destructive/10 transition-colors"
          onClick={handleDelete}
          disabled={deletePostMutation.isPending}
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete Post</span>
        </button>
      </div>

      {/* Edit Post Modal */}
      <EditPostModal
        post={post}
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
      />
    </>
  )
}

export default PostActions