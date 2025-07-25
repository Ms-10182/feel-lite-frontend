import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdatePost } from '../../hooks/usePosts'
import { postSchema, type PostFormData } from '../../lib/validations'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Textarea'
import { Input } from '../ui/Input'
import Modal from '../ui/Modal'
import LoadingSpinner from '../ui/LoadingSpinner'
import type { Post } from '../../types'

interface EditPostModalProps {
  post: Post
  isOpen: boolean
  onClose: () => void
}

const SimpleEditPostModal: React.FC<EditPostModalProps> = ({ post, isOpen, onClose }) => {
  const updatePostMutation = useUpdatePost()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    mode: 'onChange',
    defaultValues: {
      content: post.content,
      tags: post.tags.join(', '),
      images: [],
    },
  })

  const content = watch('content')

  useEffect(() => {
    if (isOpen && post) {
      reset({
        content: post.content,
        tags: post.tags.join(', '),
        images: [],
      })
    }
  }, [isOpen, post, reset])

  const onSubmit = async (data: PostFormData) => {
    const trimmedContent = data.content?.trim()
    if (!trimmedContent) {
      return
    }
    try {
      await updatePostMutation.mutateAsync({
        postId: post._id,
        data: {
          content: trimmedContent,
          tags: data.tags || ''
        }
      })
      onClose()
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const handleClose = () => {
    reset({
      content: post.content,
      tags: post.tags.join(', '),
      images: [],
    })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Post"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Content */}
        <div>
          <Textarea
            placeholder="What's on your mind?"
            rows={4}
            {...register('content')}
            className={errors.content ? 'border-destructive focus:ring-destructive' : ''}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-destructive">{errors.content.message}</p>
          )}
          <div className="mt-2 text-right">
            <span className={`text-sm ${content?.length > 1800 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {content?.length || 0}/2000
            </span>
          </div>
        </div>
        {/* Tags */}
        <div>
          <Input
            placeholder="Tags (comma-separated, e.g., technology, coding)"
            {...register('tags')}
          />
        </div>
        {/* Current Images Display */}
        {post.images && post.images.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Current Images</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {post.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Current image ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Note: Image editing is not currently supported. Current images will be preserved.
            </p>
          </div>
        )}
        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={updatePostMutation.isPending || !isValid || !content?.trim()}
          >
            {updatePostMutation.isPending ? (
              <div className="flex items-center space-x-2">
                <LoadingSpinner size="sm" />
                <span>Updating...</span>
              </div>
            ) : (
              'Update Post'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default SimpleEditPostModal
