import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../lib/api'
import type { Bookmark, Post, BookmarkedPost, CreateBookmarkData, PaginatedResponse } from '../types'

export function useBookmarks() {
  return useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      const response = await api.get<Bookmark[]>('/bookmarks')
      return response.data
    },
  })
}

export function useBookmarkedPosts(bookmarkId: string, page: number = 1) {
  return useQuery({
    queryKey: ['bookmarks', bookmarkId, 'posts', page],
    queryFn: async () => {
      const response = await api.get<{
        posts: {
          postId: string
          content: string
          images?: string[]
          createdAt: string
          totalLikes?: number
          isLiked?: boolean
          owner?: {
            _id: string
            username: string
            avatar: string
          }
        }[]
        total: number
        page: number
        limit: number
        totalPages: number
      }>(`/bookmarks/${bookmarkId}/posts`, { params: { page, limit: 10 } })
      
      console.log('Bookmarked Posts API Response:', response.data); // Debug log
      
      return response.data
    },
    enabled: !!bookmarkId,
  })
}

export function useCreateBookmark() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateBookmarkData) => {
      const response = await api.post<Bookmark>('/bookmarks', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
      toast.success('Bookmark collection created!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create bookmark'
      toast.error(message)
    },
  })
}

export function useDeleteBookmark() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (bookmarkId: string) => {
      await api.delete(`/bookmarks/${bookmarkId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
      toast.success('Bookmark collection deleted!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete bookmark'
      toast.error(message)
    },
  })
}

export function useAddToBookmark() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ postId, bookMarkId }: { postId: string; bookMarkId: string }) => {
      const response = await api.post<{ post: Post }>('/bookmarks/add/post', { postId, bookMarkId })
      return response.data.post
    },
    onSuccess: (_updatedPost, variables) => {
      // Invalidate bookmarks queries
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
      
      // Update all queries that might contain this post
      queryClient.setQueriesData(
        { predicate: (query) => {
          const queryKey = query.queryKey[0]
          return ['posts', 'trending-posts', 'user-posts', 'bookmarked-posts', 'liked-posts'].includes(String(queryKey))
        }},
        (oldData: any) => {
          if (!oldData?.pages || !Array.isArray(oldData.pages)) return oldData
          
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              docs: Array.isArray(page.docs) 
                ? page.docs.map((post: any) => 
                    post._id === variables.postId
                      ? { ...post, isBookmarked: true }
                      : post
                  )
                : page.docs
            }))
          }
        }
      )
      
      toast.success('Post added to bookmark!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to add to bookmark'
      toast.error(message)
    },
  })
}

export function useRemoveFromBookmark() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ postId, bookMarkId }: { postId: string; bookMarkId: string }) => {
      // Pass as data parameter for DELETE request with body
      await api.delete('/bookmarks/remove/post', { postId, bookMarkId })
    },
    onSuccess: () => {
      // Invalidate bookmarks queries
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
      
      // Also invalidate posts queries to update the isBookmarked status
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      
      toast.success('Post removed from bookmark!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to remove from bookmark'
      toast.error(message)
    },
  })
}