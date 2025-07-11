import React, { useState } from 'react'
import { X, Plus, Bookmark, FolderPlus, Check } from 'lucide-react'
import { useBookmarks, useCreateBookmark, useAddToBookmark } from '../../hooks/useBookmarks'
import Modal from './Modal'
import { Button } from './Button'
import { Input } from './Input'
import { Textarea } from './Textarea'
import LoadingSpinner from './LoadingSpinner'
import type { Post } from '../../types'

interface BookmarkModalProps {
  isOpen: boolean
  onClose: () => void
  post: Post
  onBookmarkToggle?: () => void
}

export default function BookmarkModal({ isOpen, onClose, post, onBookmarkToggle }: BookmarkModalProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedBookmarkId, setSelectedBookmarkId] = useState<string | null>(null)

  const { data: bookmarks, isLoading: bookmarksLoading } = useBookmarks()
  const createBookmark = useCreateBookmark()
  const addToBookmark = useAddToBookmark()

  const handleCreateBookmark = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      const newBookmark = await createBookmark.mutateAsync({
        title: title.trim(),
        description: description.trim(),
      })
      
      // Automatically add the post to the newly created bookmark
      await addToBookmark.mutateAsync({
        postId: post._id,
        bookMarkId: newBookmark._id,
      })
      
      // Trigger bookmark state update
      if (onBookmarkToggle) onBookmarkToggle()
      
      // Reset form and close modal
      setTitle('')
      setDescription('')
      setShowCreateForm(false)
      onClose()
    } catch (error) {
      // Error handling is done in the hooks
    }
  }

  const handleAddToBookmark = async (bookmarkId: string) => {
    try {
      await addToBookmark.mutateAsync({
        postId: post._id,
        bookMarkId: bookmarkId,
      })
      
      // Trigger bookmark state update
      if (onBookmarkToggle) onBookmarkToggle()
      
      onClose()
    } catch (error) {
      // Error handling is done in the hooks
    }
  }

  const handleClose = () => {
    setShowCreateForm(false)
    setTitle('')
    setDescription('')
    setSelectedBookmarkId(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Bookmark className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              Save to Bookmark
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Post Preview */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border/50">
          <p className="text-sm text-muted-foreground mb-2">Saving post by @{post.owner.username}</p>
          <p className="text-sm text-foreground line-clamp-2">
            {post.content}
          </p>
        </div>

        {/* Create New Bookmark Option */}
        {!showCreateForm && (
          <div className="mb-4">
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-border/60 rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors group"
            >
              <FolderPlus className="h-5 w-5 text-primary group-hover:text-primary" />
              <span className="text-sm font-medium text-foreground group-hover:text-primary">
                Create New Collection
              </span>
            </button>
          </div>
        )}

        {/* Create Form */}
        {showCreateForm && (
          <form onSubmit={handleCreateBookmark} className="mb-6 p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-foreground">Create New Collection</h3>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                  Collection Name *
                </label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Tech Articles, Inspiration..."
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                  Description (Optional)
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this collection..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  disabled={createBookmark.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!title.trim() || createBookmark.isPending}
                >
                  {createBookmark.isPending ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create & Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Existing Bookmarks */}
        {!showCreateForm && (
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">
              Choose an existing collection:
            </h3>
            
            {bookmarksLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : bookmarks && bookmarks.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {bookmarks.map((bookmark) => (
                  <button
                    key={bookmark._id}
                    onClick={() => handleAddToBookmark(bookmark._id)}
                    disabled={addToBookmark.isPending}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      selectedBookmarkId === bookmark._id
                        ? 'bg-primary/10 border-primary/20'
                        : 'bg-card border-border/50 hover:bg-muted/50 hover:border-border'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Bookmark className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">
                          {bookmark.title}
                        </p>
                        {bookmark.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {bookmark.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {addToBookmark.isPending && selectedBookmarkId === bookmark._id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Check className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">
                  No bookmark collections yet
                </p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Collection
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
