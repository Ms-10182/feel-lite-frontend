import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../lib/api'
import type { Post, LikedPost } from '../types'

export function useLikedPosts() {
  return useQuery({
    queryKey: ['likes', 'posts'],
    queryFn: async () => {
      const response = await api.get<LikedPost[]>('/likes/posts')
      
      console.log('Liked Posts API Response:', response.data) // Debug log
      
      // Return the simplified liked post data as-is
      return response.data
    },
    retry: (failureCount, error: any) => {
      // Don't retry if it's a 404 (no liked posts)
      if (error?.response?.status === 404) return false
      return failureCount < 3
    },
  })
}

export function useTogglePostLike() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId: string) => {
      await api.post(`/likes/toggle/post/${postId}`)
    },
    onSuccess: (_, postId) => {
      // Invalidate specific post data to ensure it's refetched with updated like status
      queryClient.invalidateQueries({ queryKey: ['posts', postId] })
      
      // Invalidate all post lists that might contain this post
      queryClient.invalidateQueries({ queryKey: ['posts', 'global'] })
      queryClient.invalidateQueries({ queryKey: ['posts', 'recommended'] })
      queryClient.invalidateQueries({ queryKey: ['posts', 'my-posts'] })
      queryClient.invalidateQueries({ queryKey: ['posts', 'hashtag'] })
      
      // Invalidate likes list
      queryClient.invalidateQueries({ queryKey: ['likes'] })
      
      console.log('Invalidated queries after like toggle for post:', postId)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to toggle like'
      toast.error(message)
    },
  })
}

export function useToggleCommentLike() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (commentId: string) => {
      await api.post(`/likes/toggle/comment/${commentId}`)
    },
    onSuccess: (_, commentId) => {
      // Invalidate specific comment data
      queryClient.invalidateQueries({ queryKey: ['comments', commentId] })
      
      // Invalidate all comments lists
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      
      // Invalidate likes list
      queryClient.invalidateQueries({ queryKey: ['likes'] })
      
      console.log('Invalidated queries after like toggle for comment:', commentId)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to toggle like'
      toast.error(message)
    },
  })
}

export function useRemoveLikedPost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId: string) => {
      // Since we're using toggle, calling it on a liked post will unlike it
      await api.post(`/likes/toggle/post/${postId}`)
    },
    onSuccess: (_, postId) => {
      // Invalidate specific post data
      queryClient.invalidateQueries({ queryKey: ['posts', postId] })
      
      // Invalidate all post lists that might contain this post
      queryClient.invalidateQueries({ queryKey: ['posts', 'global'] })
      queryClient.invalidateQueries({ queryKey: ['posts', 'recommended'] })
      queryClient.invalidateQueries({ queryKey: ['posts', 'my-posts'] })
      queryClient.invalidateQueries({ queryKey: ['posts', 'hashtag'] })
      
      // Invalidate likes list
      queryClient.invalidateQueries({ queryKey: ['likes'] })
      
      toast.success('Post removed from liked posts')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to remove from liked posts'
      toast.error(message)
    },
  })
}