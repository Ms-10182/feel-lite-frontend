import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Bookmark, Trash2 } from 'lucide-react'
import { useBookmarks, useBookmarkedPosts, useCreateBookmark, useDeleteBookmark, useRemoveFromBookmark } from '../hooks/useBookmarks'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { bookmarkSchema, type BookmarkFormData } from '../lib/validations'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import Modal from '../components/ui/Modal'
import MinimalPostCard from '../components/post/MinimalPostCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const BookmarksPage: React.FC = () => {
  const { bookmarkId } = useParams()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [page, setPage] = useState(1)

  const { data: bookmarks, isLoading: bookmarksLoading } = useBookmarks()
  const { data: bookmarkedPosts, isLoading: postsLoading } = useBookmarkedPosts(
    bookmarkId || '', 
    page
  )
  
  const createBookmarkMutation = useCreateBookmark()
  const deleteBookmarkMutation = useDeleteBookmark()
  const removeFromBookmarkMutation = useRemoveFromBookmark()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BookmarkFormData>({
    resolver: zodResolver(bookmarkSchema),
  })

  const onCreateBookmark = async (data: BookmarkFormData) => {
    try {
      await createBookmarkMutation.mutateAsync(data)
      setShowCreateModal(false)
      reset()
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const handleDeleteBookmark = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this bookmark collection?')) {
      try {
        await deleteBookmarkMutation.mutateAsync(id)
      } catch (error) {
        // Error handling is done in the hook
      }
    }
  }

  const handleRemoveFromBookmark = async (postId: string) => {
    try {
      await removeFromBookmarkMutation.mutateAsync({
        postId,
        bookMarkId: bookmarkId || '',
      })
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  if (bookmarksLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Show specific bookmark collection
  if (bookmarkId) {
    const bookmark = bookmarks?.find(b => b._id === bookmarkId)
    
    if (!bookmark) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Bookmark collection not found.</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h1 className="text-2xl font-bold text-foreground flex items-center">
            <Bookmark className="h-6 w-6 mr-3 text-amber-500" />
            {bookmark.title}
          </h1>
          {bookmark.description && (
            <p className="text-muted-foreground mt-2">{bookmark.description}</p>
          )}
        </div>

        {/* Posts */}
        {postsLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-6">
            {bookmarkedPosts?.posts.map((bookmarkedPost, index) => (
              <div key={bookmarkedPost.postId} className="relative">
                <MinimalPostCard 
                  post={bookmarkedPost} 
                  type="bookmarked"
                  onRemove={handleRemoveFromBookmark}
                  isRemoving={removeFromBookmarkMutation.isPending}
                />
                {/* Subtle separator line for better visual separation */}
                {index < bookmarkedPosts.posts.length - 1 && (
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent opacity-40" />
                )}
              </div>
            ))}
            
            {bookmarkedPosts?.posts.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                  <Bookmark className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No posts in this collection yet</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Bookmark posts to add them to this collection!
                </p>
              </div>
            )}
            
            {bookmarkedPosts && bookmarkedPosts.page < bookmarkedPosts.totalPages && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(prev => prev + 1)}
                  className="min-w-[120px]"
                >
                  Load More
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Show all bookmark collections
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center">
          <Bookmark className="h-6 w-6 mr-3 text-amber-500" />
          Bookmarks
        </h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Collection
        </Button>
      </div>

      {/* Bookmark Collections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookmarks?.map((bookmark) => (
          <div
            key={bookmark._id}
            className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">{bookmark.title}</h3>
                {bookmark.description && (
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{bookmark.description}</p>
                )}
                <p className="text-muted-foreground text-xs">
                  Created {new Date(bookmark.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteBookmark(bookmark._id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => window.location.href = `/bookmarks/${bookmark._id}`}
              >
                View Collection
              </Button>
            </div>
          </div>
        ))}
        
        {bookmarks?.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
              <Bookmark className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No bookmark collections yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-4">
              Create a collection to start saving your favorite posts!
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              Create Your First Collection
            </Button>
          </div>
        )}
      </div>

      {/* Create Bookmark Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Bookmark Collection"
      >
        <form onSubmit={handleSubmit(onCreateBookmark)} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
              Title
            </label>
            <Input
              id="title"
              placeholder="Collection title"
              {...register('title')}
              className={errors.title ? 'border-destructive focus:ring-destructive/30' : ''}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
              Description (optional)
            </label>
            <Textarea
              id="description"
              placeholder="Describe this collection..."
              rows={3}
              {...register('description')}
              className={errors.description ? 'border-destructive focus:ring-destructive/30' : ''}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createBookmarkMutation.isPending}
            >
              {createBookmarkMutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Collection'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default BookmarksPage