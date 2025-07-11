import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../lib/api'
import type { ChangePasswordData, UpdateUserData } from '../types'

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      await api.patch('/users/changePassword', data)
    },
    onSuccess: () => {
      toast.success('Password changed successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to change password'
      toast.error(message)
    },
  })
}

export function useUpdateEmail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newEmail: string) => {
      await api.patch('/users/updateAccountDetails', { newEmail })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      toast.success('Email updated successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update email'
      toast.error(message)
    },
  })
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (avatarIdx: number) => {
      await api.patch('/users/updateAvatar', { avatarIdx })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      toast.success('Avatar updated successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update avatar'
      toast.error(message)
    },
  })
}

export function useUpdateCoverImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (coverImageIdx: number) => {
      await api.patch('/users/updateCoverImage', { coverImageIdx })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      toast.success('Cover image updated successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update cover image'
      toast.error(message)
    },
  })
}

export function useChangeUsername() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await api.patch('/users/changeUsername')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      toast.success('Username updated successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update username'
      toast.error(message)
    },
  })
}