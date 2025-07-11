import React, { createContext, useContext, useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../lib/api'
import type { User, AuthResponse, LoginFormData, RegisterFormData } from '../types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  authError: string | null
  login: (data: LoginFormData) => Promise<void>
  register: (data: RegisterFormData) => Promise<void>
  logout: () => Promise<void>
  logoutEverywhere: () => Promise<void>
  refetchUser: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Function to attempt token refresh and then get user
  const initializeAuth = async () => {
    try {
      // First try to get user with current token
      console.log('Attempting to get user info with current token...');
      const response = await api.get<User>('/users/getUser')
      console.log('Successfully retrieved user info');
      setAuthError(null);
      return response.data
    } catch (error: any) {
      console.log('Error getting user:', error?.response?.data || error.message);
      
      // If there's a persistent error with authentication, store it
      if (
        (error.response?.status === 500 && 
         error.response?.data?.message === 'invalid token or expired') || 
        error.response?.status === 401
      ) {
        setAuthError(error.response?.data?.message || 'Authentication failed');
        return null;
      }
      
      // Network error or other errors
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        console.warn('Backend API not available:', error.message);
        setAuthError('Network error. Please try again later.');
      } else {
        console.warn('Error during auth initialization:', error.message);
      }
      return null;
    }
  }

  const { data: user, isLoading: isUserLoading, refetch: refetchUser } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const result = await initializeAuth()
      setIsInitialized(true)
      return result
    },
    retry: (failureCount, error: any) => {
      // Don't retry if it's a 401/500 with auth error
      if (
        error?.response?.status === 401 || 
        (error?.response?.status === 500 && 
         error?.response?.data?.message === 'invalid token or expired')
      ) {
        return false;
      }
      return failureCount < 2; // Only retry network errors twice
    },
    enabled: !isInitialized,
  })
  
  // Clear auth data and show login page if auth is failed
  useEffect(() => {
    const isLoading = !isInitialized || isUserLoading;
    if (authError && !isLoading) {
      console.log('Authentication failed, clearing local data');
      
      // Clear local storage
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Clear React Query cache
      queryClient.clear();
      
      // Create a flag to prevent infinite redirect loops
      const redirectFlag = 'auth_redirect_' + Date.now();
      if (!sessionStorage.getItem(redirectFlag) && !window.location.pathname.includes('/login')) {
        sessionStorage.setItem(redirectFlag, 'true');
        
        // Clean up the flag after a delay
        setTimeout(() => {
          sessionStorage.removeItem(redirectFlag);
        }, 5000);
        
        // Redirect to login page
        window.location.href = '/login';
      }
    }
  }, [authError, isInitialized, isUserLoading]);
  
  // Show a toast when auth error is set
  useEffect(() => {
    if (authError) {
      toast.error(`Authentication error: ${authError}. Please log in again.`);
    }
  }, [authError]);

  const login = async (data: LoginFormData) => {
    try {
      const response = await api.post<AuthResponse>('/users/login', data)
      queryClient.setQueryData(['user'], response.data.user)
      toast.success('Welcome back!')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      throw error
    }
  }

  const register = async (data: RegisterFormData) => {
    try {
      await api.post('/users/register', data)
      toast.success('Account created successfully! Please log in.')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      throw error
    }
  }

  const logout = async () => {
    try {
      await api.post('/users/logout')
      queryClient.setQueryData(['user'], null)
      queryClient.clear()
      toast.success('Logged out successfully')
    } catch (error: any) {
      // Still clear local state even if API call fails
      queryClient.setQueryData(['user'], null)
      queryClient.clear()
      toast.error('Logout failed, but you have been logged out locally')
    }
  }

  const logoutEverywhere = async () => {
    try {
      await api.post('/users/logoutFromEveryWhere')
      queryClient.setQueryData(['user'], null)
      queryClient.clear()
      toast.success('Logged out from all devices')
    } catch (error: any) {
      queryClient.setQueryData(['user'], null)
      queryClient.clear()
      toast.error('Logout failed, but you have been logged out locally')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading: !isInitialized || isUserLoading,
        authError,
        login,
        register,
        logout,
        logoutEverywhere,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}