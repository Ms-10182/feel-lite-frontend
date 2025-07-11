import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../lib/api'
import type { Comment, Thread, PaginatedResponse, CreateCommentData } from '../types'

export function useComments(postId: string, page: number = 1) {
  return useQuery({
    queryKey: ['comments', postId, page],
    queryFn: async () => {
      const response = await api.get<any>(`/comments/post/${postId}`, { 
        params: { page, limit: 10 } 
      })
      
      // Handle the API response format: {statusCode, data: {comments: [...], total, page, limit, totalPages}, message, success}
      if (response.data && response.data.data) {
        return response.data.data
      }
      
      // Fallback for different response structure
      return response.data
    },
    enabled: !!postId,
  })
}

export function useThreads(commentId: string) {
  return useQuery({
    queryKey: ['threads', commentId],
    queryFn: async () => {
      const response = await api.get<any>(`/threads/comment/${commentId}`)
      
      // Handle the API response format: {statusCode, data: {threads: [...], paginator: {...}}, message, success}
      if (response.data && response.data.data && Array.isArray(response.data.data.threads)) {
        return response.data.data.threads
      }
      
      // Check if threads is directly in response.data
      if (response.data && Array.isArray(response.data.threads)) {
        return response.data.threads
      }
      
      // Check if it's directly an array
      if (Array.isArray(response.data)) {
        return response.data
      }
      
      return []
    },
    enabled: !!commentId,
    staleTime: 0, // Force refetch
    gcTime: 0, // Don't cache (formerly cacheTime)
  })
}

export function useCreateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ postId, data }: { postId: string; data: CreateCommentData }) => {
      const response = await api.post<any>(`/comments/post/${postId}`, data)
      
      // Handle the API response format: {statusCode, data: {...}, message, success}
      if (response.data && response.data.data) {
        return response.data.data
      }
      
      // Fallback for different response structure
      return response.data
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      toast.success('Comment added successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to add comment'
      toast.error(message)
    },
  })
}

export function useCreateThread() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ commentId, data }: { commentId: string; data: CreateCommentData }) => {
      const response = await api.post<any>(`/threads/comment/${commentId}`, data)
      
      // Handle the API response format: {statusCode, data: {...}, message, success}
      if (response.data && response.data.data) {
        return response.data.data
      }
      
      // Fallback for different response structure
      return response.data
    },
    onSuccess: (_, { commentId }) => {
      queryClient.invalidateQueries({ queryKey: ['threads', commentId] })
      toast.success('Reply added successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to add reply'
      toast.error(message)
    },
  })
}

export function useUpdateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ commentId, data }: { commentId: string; data: CreateCommentData }) => {
      const response = await api.patch<any>(`/comments/${commentId}`, data)
      
      // Handle the API response format: {statusCode, data: {...}, message, success}
      if (response.data && response.data.data) {
        return response.data.data
      }
      
      // Fallback for different response structure
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      toast.success('Comment updated successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update comment'
      toast.error(message)
    },
  })
}

export function useDeleteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (commentId: string) => {
      await api.delete(`/comments/${commentId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      toast.success('Comment deleted successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete comment'
      toast.error(message)
    },
  })
}

export function useUpdateThread() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ threadId, data }: { threadId: string; data: CreateCommentData }) => {
      const response = await api.patch<any>(`/threads/${threadId}`, data)
      
      // Handle the API response format: {statusCode, data: {...}, message, success}
      if (response.data && response.data.data) {
        return response.data.data
      }
      
      // Fallback for different response structure
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads'] })
      toast.success('Reply updated successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update reply'
      toast.error(message)
    },
  })
}

export function useDeleteThread() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (threadId: string) => {
      await api.delete(`/threads/${threadId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads'] })
      toast.success('Reply deleted successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete reply'
      toast.error(message)
    },
  })
}

export function useDeleteThreadAsPostOwner() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (threadId: string) => {
      await api.delete(`/threads/post-owner/${threadId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads'] })
      toast.success('Reply deleted successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete reply'
      toast.error(message)
    },
  })
}