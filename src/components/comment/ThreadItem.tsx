import React, { useState, useEffect, useRef } from 'react'
import { MoreHorizontal, Edit2, Trash2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useUpdateThread, useDeleteThread, useDeleteThreadAsPostOwner } from '../../hooks/useComments'
import { formatDate } from '../../lib/utils'
import Avatar from '../ui/Avatar'
import { Button } from '../ui/Button'
import Modal from '../ui/Modal'
import { Textarea } from '../ui/Textarea'
import type { Thread } from '../../types'

interface ThreadItemProps {
  thread: Thread
  postOwnerId?: string
}

const ThreadItem: React.FC<ThreadItemProps> = ({ thread, postOwnerId }) => {
  const { user } = useAuth()
  const [showActions, setShowActions] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(thread.content)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const actionsRef = useRef<HTMLDivElement>(null)
  
  const updateThreadMutation = useUpdateThread()
  const deleteThreadMutation = useDeleteThread()
  const deleteThreadAsPostOwnerMutation = useDeleteThreadAsPostOwner()
  
  const isOwner = user?._id === thread.owner._id
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

  const handleEdit = () => {
    setIsEditing(true)
    setShowActions(false)
  }

  const handleSaveEdit = async () => {
    if (editContent.trim() === thread.content) {
      setIsEditing(false)
      return
    }

    try {
      await updateThreadMutation.mutateAsync({
        threadId: thread._id,
        data: { content: editContent.trim() }
      })
      setIsEditing(false)
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const handleCancelEdit = () => {
    setEditContent(thread.content)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    try {
      if (isOwner) {
        await deleteThreadMutation.mutateAsync(thread._id)
      } else if (isPostOwner) {
        await deleteThreadAsPostOwnerMutation.mutateAsync(thread._id)
      }
      setShowDeleteModal(false)
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  return (
    <div className="flex items-start space-x-2">
      <Avatar
        src={thread.owner.avatar}
        alt={thread.owner.username}
        fallback={thread.owner.username.charAt(0)}
        size="sm"
      />
      
      <div className="flex-1 min-w-0">
        <div className="bg-muted rounded-lg p-2">
          <div className="flex items-center justify-between mb-1">
            <h5 className="font-medium text-foreground text-xs">
              {thread.owner.username}
            </h5>
            
            {(isOwner || isPostOwner) && (
              <div className="relative" ref={actionsRef}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5"
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
                placeholder="Edit your reply..."
                className="min-h-[60px] text-xs"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={updateThreadMutation.isPending || !editContent.trim()}
                >
                  {updateThreadMutation.isPending ? 'Saving...' : 'Save'}
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
            <p className="text-foreground text-xs">{thread.content}</p>
          )}
        </div>
        
        <div className="mt-1">
          <span className="text-xs text-muted-foreground">
            {formatDate(thread.createdAt)}
          </span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Reply"
      >
        <div className="space-y-4">
          <p className="text-foreground">Are you sure you want to delete this reply?</p>
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
              disabled={deleteThreadMutation.isPending || deleteThreadAsPostOwnerMutation.isPending}
            >
              {(deleteThreadMutation.isPending || deleteThreadAsPostOwnerMutation.isPending) ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ThreadItem