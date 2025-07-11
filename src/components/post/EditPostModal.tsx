import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Image, X } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { useUpdatePost } from '../../hooks/usePosts'
import { postSchema, type PostFormData } from '../../lib/validations'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Textarea'
import { Input } from '../ui/Input'
import Modal from '../ui/Modal'
import LoadingSpinner from '../ui/LoadingSpinner'
import { validateFileType, validateFileSize, formatFileSize } from '../../lib/utils'
import type { Post } from '../../types'

interface EditPostModalProps {
  post: Post
  isOpen: boolean
  onClose: () => void
}

const EditPostModal: React.FC<EditPostModalProps> = ({ post, isOpen, onClose }) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const updatePostMutation = useUpdatePost()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
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

  // Reset form when post changes or modal opens
  useEffect(() => {
    if (isOpen && post) {
      reset({
        content: post.content,
        tags: post.tags.join(', '),
        images: [],
      })
      setSelectedImages([])
    }
  }, [isOpen, post, reset])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.heic'],
    },
    maxFiles: 5,
    onDrop: (acceptedFiles) => {
      const validFiles = acceptedFiles.filter(file => {
        if (!validateFileType(file)) {
          return false
        }
        if (!validateFileSize(file)) {
          return false
        }
        return true
      })

      const newImages = [...selectedImages, ...validFiles].slice(0, 5)
      setSelectedImages(newImages)
      setValue('images', newImages)
    },
  })

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index)
    setSelectedImages(newImages)
    setValue('images', newImages)
  }

  const onSubmit = async (data: PostFormData) => {
    const trimmedContent = data.content?.trim()
    if (!trimmedContent) {
      return
    }

    const submitData = {
      content: trimmedContent,
      tags: data.tags?.trim() || undefined,
    }

    try {
      await updatePostMutation.mutateAsync({
        postId: post._id,
        data: submitData,
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
    setSelectedImages([])
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

        {/* New Image Upload (Optional Feature) */}
        {selectedImages.length === 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Add New Images (Optional)</h4>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-primary-400 bg-primary-50' 
                  : 'border-input hover:border-ring'
              }`}
            >
              <input {...getInputProps()} />
              <Image className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
              <p className="text-sm text-foreground">
                {isDragActive 
                  ? 'Drop images here...' 
                  : 'Drag & drop images, or click to select'
                }
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Max 5 images, PNG/JPEG/HEIC, up to 10MB each
              </p>
            </div>
          </div>
        )}

        {/* Selected New Images */}
        {selectedImages.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">New Images to Add</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {selectedImages.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <div className="absolute bottom-1 left-1 px-1 py-0.5 bg-black/70 text-white text-xs rounded">
                    {formatFileSize(file.size)}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Note: New image upload functionality is not yet implemented in the API. Only content and tags can be edited.
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

export default EditPostModal
