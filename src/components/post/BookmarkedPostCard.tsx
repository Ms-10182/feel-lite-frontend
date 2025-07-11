import React from 'react'
import { Calendar, Image as ImageIcon, BookmarkX, Trash2 } from 'lucide-react'
import { useRemoveFromBookmark } from '../../hooks/useBookmarks'
import { formatDate } from '../../lib/utils'
import { Button } from '../ui/Button'
import LoadingSpinner from '../ui/LoadingSpinner'

interface BookmarkedPostData {
  postId: string
  content: string
  images: string[]
  createdAt: string
}

interface BookmarkedPostCardProps {
  post: BookmarkedPostData
  bookmarkId: string
  onRemove?: () => void
}

const BookmarkedPostCard: React.FC<BookmarkedPostCardProps> = ({ post, bookmarkId, onRemove }) => {
  const removeFromBookmark = useRemoveFromBookmark()

  const handleRemove = async () => {
    if (window.confirm('Are you sure you want to remove this post from your bookmarks?')) {
      try {
        await removeFromBookmark.mutateAsync({
          postId: post.postId,
          bookMarkId: bookmarkId,
        })
        onRemove?.()
      } catch (error) {
        // Error handling is done in the hook
      }
    }
  }
  return (
    <div className="post-card-shadow hover:post-card-shadow-hover bg-card rounded-2xl border border-border/60 overflow-hidden transition-all duration-300 hover:border-border hover:scale-[1.01] hover:bg-card/90 group">
      {/* Header */}
      <div className="p-4 sm:p-6 pb-3 sm:pb-4 post-gradient-header border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bookmarked Post</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(post.createdAt)}
            </div>
            <Button
              onClick={handleRemove}
              disabled={removeFromBookmark.isPending}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-2 transition-all duration-200 opacity-70 group-hover:opacity-100"
              title="Remove from bookmarks"
            >
              {removeFromBookmark.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                <BookmarkX className="h-4 w-4 hover:scale-110 transition-transform" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        <div className="prose prose-sm max-w-none">
          <p className="text-foreground whitespace-pre-wrap break-words">
            {post.content}
          </p>
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {post.images.map((image, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`Post image ${index + 1}`}
                    className="w-full h-48 sm:h-32 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bookmark Status */}
        <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-primary">
                Saved to your bookmarks
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Click the <BookmarkX className="h-3 w-3 inline mx-1" /> icon to remove
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookmarkedPostCard
