import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../lib/api'

// Get user data
export function useGetUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await api.get<any>('/users/getUser')
      
      if (response.data && response.data.data) {
        return response.data.data
      }
      
      return response.data
    },
  })
}

// Generate OTP for authenticated users
export function useGenerateAuthOtp() {
  return useMutation({
    mutationFn: async () => {
      const response = await api.post<any>('/users/auth/generateOtp')
      return response.data
    },
    onSuccess: (data) => {
      toast.success(data?.message || 'OTP sent to your email!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to generate OTP'
      toast.error(message)
    },
  })
}

// Generate OTP for unauthenticated users (like forgot password)
export function useGenerateUnauthOtp() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await api.post<any>('/users/unauth/generateOtp', { email })
      return response.data
    },
    onSuccess: (data) => {
      toast.success(data?.message || 'OTP sent to your email!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to generate OTP'
      toast.error(message)
    },
  })
}

// Forgot password with OTP
export function useForgotPassword() {
  return useMutation({
    mutationFn: async ({ email, otp, newPassword }: { email: string; otp: string; newPassword: string }) => {
      const response = await api.post<any>('/users/forgotPassword', {
        email,
        otp,
        newPassword
      })
      return response.data
    },
    onSuccess: (data) => {
      toast.success(data?.message || 'Password reset successfully!')
      // Redirect to login page
      window.location.href = '/login'
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to reset password'
      toast.error(message)
    },
  })
}

// Change email
export function useChangeEmail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ newEmail, otp }: { newEmail: string; otp: string }) => {
      const response = await api.patch<any>('/users/updateAccountDetails', {
        newEmail,
        otp
      })
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      toast.success(data?.message || 'Email updated successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update email'
      toast.error(message)
    },
  })
}

// Change password
export function useChangePassword() {
  return useMutation({
    mutationFn: async ({ oldPassword, newPassword, otp }: { oldPassword: string; newPassword: string; otp: string }) => {
      const response = await api.patch<any>('/users/changePassword', {
        oldPassword,
        newPassword,
        otp
      })
      return response.data
    },
    onSuccess: (data) => {
      toast.success(data?.message || 'Password changed successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to change password'
      toast.error(message)
    },
  })
}

// Logout current device
export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      const response = await api.post<any>('/users/logout')
      return response.data
    },
    onSuccess: (data) => {
      toast.success(data?.message || 'Logged out successfully!')
      // Redirect to login page
      window.location.href = '/login'
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to logout'
      toast.error(message)
    },
  })
}

// Logout from all devices
export function useLogoutFromAllDevices() {
  return useMutation({
    mutationFn: async () => {
      const response = await api.post<any>('/users/logoutFromEveryWhere')
      return response.data
    },
    onSuccess: (data) => {
      toast.success(data?.message || 'Logged out from all devices successfully!')
      // Redirect to login page
      window.location.href = '/login'
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to logout from all devices'
      toast.error(message)
    },
  })
}

// Delete account
export function useDeleteAccount() {
  return useMutation({
    mutationFn: async ({ password, otp }: { password: string; otp: string }) => {
      const response = await api.delete<any>('/users/deleteAccount', {
        password,otp
      })
      return response.data
    },
    onSuccess: (data) => {
      toast.success(data?.message || 'Account deleted successfully!')
      // Redirect to login page
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete account'
      toast.error(message)
    },
  })
}
