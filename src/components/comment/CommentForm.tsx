import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { commentSchema, type CommentFormData } from '../../lib/validations'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Textarea'
import LoadingSpinner from '../ui/LoadingSpinner'

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>
  isSubmitting: boolean
  placeholder?: string
}

const CommentForm: React.FC<CommentFormProps> = ({ 
  onSubmit, 
  isSubmitting, 
  placeholder = "Write a comment..." 
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  })

  const content = watch('content')

  const handleFormSubmit = async (data: CommentFormData) => {
    try {
      await onSubmit(data.content)
      reset()
    } catch (error) {
      // Error handling is done in parent component
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
      <div>
        <Textarea
          placeholder={placeholder}
          rows={3}
          {...register('content')}
          className={errors.content ? 'border-error-500 focus:ring-error-400' : ''}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-error-600">{errors.content.message}</p>
        )}
        <div className="mt-2 text-right">
          <span className={`text-sm ${content?.length > 450 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {content?.length || 0}/500
          </span>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || !content?.trim()}
          size="sm"
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <LoadingSpinner size="sm" />
              <span>Posting...</span>
            </div>
          ) : (
            'Comment'
          )}
        </Button>
      </div>
    </form>
  )
}

export default CommentForm