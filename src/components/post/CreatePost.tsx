import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Image, X, Plus } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { useCreatePost } from '../../hooks/usePosts'
import { postSchema, type PostFormData } from '../../lib/validations'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Textarea'
import { Input } from '../ui/Input'
import LoadingSpinner from '../ui/LoadingSpinner'
import { validateFileType, validateFileSize, formatFileSize } from '../../lib/utils'

const CreatePost: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const createPostMutation = useCreatePost()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    mode: 'onChange', // Enable real-time validation
    defaultValues: {
      content: '',
      tags: '',
      images: [],
    },
  })

  const content = watch('content')

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
    // Ensure content is trimmed and not empty
    const trimmedContent = data.content?.trim()
    if (!trimmedContent) {
      return // This should be caught by validation, but double-check
    }

    const submitData = {
      content: trimmedContent,
      tags: data.tags?.trim() || undefined,
      images: selectedImages,
    }
    
    console.log('Submitting post data:', {
      content: submitData.content,
      tags: submitData.tags,
      imageCount: submitData.images.length,
      imageDetails: submitData.images.map(img => ({
        name: img.name,
        type: img.type,
        size: img.size
      }))
    })

    try {
      await createPostMutation.mutateAsync(submitData)
      
      reset({
        content: '',
        tags: '',
        images: [],
      })
      setSelectedImages([])
      setIsExpanded(false)
    } catch (error) {
      console.error('Failed to create post:', error)
      // Error handling is done in the hook
    }
  }

  if (!isExpanded) {
    return (
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full text-left p-4 border border-input rounded-lg hover:border-ring transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <span className="text-muted-foreground">What's on your mind?</span>
        </button>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
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

        {/* Image Upload */}
        <div>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary-400 bg-primary-50' 
                : 'border-input hover:border-ring'
            }`}
          >
            <input {...getInputProps()} />
            <Image className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
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

        {/* Selected Images */}
        {selectedImages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {selectedImages.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1 bg-error-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="absolute bottom-1 left-1 px-1 py-0.5 bg-black/70 text-white text-xs rounded">
                  {formatFileSize(file.size)}
                </div>
              </div>
            ))}
          </div>
        )}

        {errors.images && (
          <p className="text-sm text-error-600">{errors.images.message}</p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setIsExpanded(false)
              reset({
                content: '',
                tags: '',
                images: [],
              })
              setSelectedImages([])
            }}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            disabled={createPostMutation.isPending || !isValid || !content?.trim()}
          >
            {createPostMutation.isPending ? (
              <div className="flex items-center space-x-2">
                <LoadingSpinner size="sm" />
                <span>Posting...</span>
              </div>
            ) : (
              'Post'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreatePost