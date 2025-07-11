import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../lib/api'
import type { User, PaginatedResponse, BanUserData } from '../types'

export function useBannedUsers(page: number = 1) {
  return useQuery({
    queryKey: ['admin', 'banned-users', page],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<User>>('/admin/users/banned', {
        page,
        limit: 10,
      })
      return response.data
    },
  })
}

export function useBanUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: BanUserData }) => {
      await api.post(`/admin/users/${userId}/ban`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      toast.success('User banned successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to ban user'
      toast.error(message)
    },
  })
}

export function useUnbanUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      await api.post(`/admin/users/${userId}/unban`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      toast.success('User unbanned successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to unban user'
      toast.error(message)
    },
  })
}