import axios from 'axios'
import toast from 'react-hot-toast'
import type { ApiResponse } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL 
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://57.159.27.100:8080/api/v1'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Refresh token function to be used by interceptor
const refreshAccessToken = async () => {
  console.log('Refreshing access token...');
  return apiClient.post('/users/loginUsingRefreshToken');
};

// Request interceptor - add auth headers if available
apiClient.interceptors.request.use(
  (config) => {
    // Handle FormData by letting the browser set the correct Content-Type with boundary
    if (config.data instanceof FormData) {
      console.log('FormData detected in request, removing Content-Type header');
      // Remove Content-Type so browser sets it correctly with boundary
      delete config.headers['Content-Type'];
      
      // Debug log for FormData POST requests to /posts endpoint
      if (config.url?.includes('/posts') && config.method === 'post') {
        console.log('FormData POST request details:', {
          url: config.url,
          method: config.method,
          fields: Array.from((config.data as FormData).keys()),
          hasContent: (config.data as FormData).has('content'),
          contentValue: (config.data as FormData).get('content'),
          hasPostImage: (config.data as FormData).has('postImage'),
          postImageCount: Array.from((config.data as FormData).entries())
            .filter(([key]) => key === 'postImage').length
        });
      }
    }
    
    // Print request info for debugging FormData issues
    if (config.url?.includes('/posts') && config.method === 'post') {
      console.log('POST request to /posts:', {
        url: config.url,
        method: config.method,
        isFormData: config.data instanceof FormData,
        headers: config.headers,
        dataType: typeof config.data
      });
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Flag to prevent multiple refresh requests
let isRefreshing = false;
// Queue of requests to be retried after token refresh
type QueueItem = {
  resolve: () => void;
  reject: (reason?: any) => void;
}
let failedQueue: QueueItem[] = [];

// Process queued requests after token refresh
const processQueue = (error: Error | null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  
  failedQueue = [];
};

// Response interceptor for auto token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check for JWT expiration in different ways
    const isTokenExpired = 
      error.response?.status === 401 || 
      error.response?.data?.message === 'jwt expired' ||
      error.message?.includes('jwt expired');
      
    // Handle token expiration
    if (isTokenExpired && !originalRequest._retry) {
      console.log('Token expired, attempting refresh...', originalRequest.url);
      
      // If refresh already in progress, queue this request
      if (isRefreshing) {
        console.log('Refresh already in progress, queueing request:', originalRequest.url);
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(null),
            reject
          });
        })
        .then(() => {
          console.log('Retrying request after refresh completed:', originalRequest.url);
          return apiClient(originalRequest);
        })
        .catch(err => {
          console.log('Failed request in queue rejected:', err);
          return Promise.reject(err);
        });
      }
      
      // Start refresh process
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Attempt to refresh the token
        const response = await refreshAccessToken();
        console.log('Token refreshed successfully:', response.data?.message || 'Success');
        
        // Process queued requests
        processQueue(null);
        
        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError: any) {
        console.error('Token refresh failed:', refreshError?.response?.data || refreshError.message);
        
        // Check if this is a server error or invalid/expired token
        const isAuthError = 
          refreshError?.response?.status === 500 && 
          (refreshError?.response?.data?.message === 'invalid token or expired' ||
           refreshError?.response?.data?.message?.includes('token'));
        
        // Reject all queued requests
        processQueue(refreshError);
        
        // Clear any cached user data
        if (typeof window !== 'undefined') {
          // Clear localStorage if you're using it
          localStorage.removeItem('user');
          
          // Also clear any other auth-related data
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          
          // If this is an auth error, silently redirect to login
          if (isAuthError) {
            console.log('Authentication failed - redirecting to login');
            
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
            } else {
              console.warn('Prevented redirect loop to login page');
            }
          }
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || 'An error occurred'
    
    // Check if it's a network error (backend not running)
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      console.warn('Backend server is not running on', API_BASE_URL)
      // Don't show toast for network errors during development
      return Promise.reject(error)
    }
    
    // Special handling for JWT errors that might not be caught by the 401 check
    if (errorMessage === 'jwt expired' || errorMessage.includes('jwt')) {
      console.warn('JWT error detected outside of 401 handler:', errorMessage)
      // Don't show toast for JWT errors as they will be handled by refresh or redirect
      return Promise.reject(error)
    }
    
    // Log error details for debugging
    console.error(`API Error [${error.response?.status}]:`, {
      url: error.config?.url,
      method: error.config?.method,
      error: errorMessage,
      details: error.response?.data
    })
    
    if (error.response?.status >= 500) {
      // toast.error('Server error. Please try again later.')
    } else if (error.response?.status === 403) {
      toast.error('Access denied')
    } else if (error.response?.status === 404) {
      // Only show "not found" errors for specific endpoints
      // Avoid showing errors for queries that might legitimately return 404
      if (!error.config.url?.includes('/likes/posts') && 
          !error.config.url?.includes('/bookmarks/') &&
          !error.config.url?.includes('/posts/archived-posts')) {
        // toast.error('Resource not found')
      }
    }

    return Promise.reject(error)
  }
)

// Helper function to test form data handling
const testFormDataHandling = async (formData: FormData) => {
  try {
    // Log all form data entries
    console.log('Testing FormData handling - Entries:');
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value instanceof File ? `File: ${value.name} (${value.type})` : value}`);
    }
    
    // Try a different endpoint to debug the backend's form handling
    const formDataTest = await apiClient.post('/test-formdata', formData);
    console.log('FormData test response:', formDataTest.data);
    return formDataTest;
  } catch (error) {
    console.error('FormData test failed:', error);
    throw error;
  }
};

  // API wrapper functions
const api = {
  get: <T>(url: string, params?: any): Promise<ApiResponse<T>> =>
    apiClient.get(url, { params }).then(res => res.data),
  
  post: <T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> => {
    // Debug logging for FormData in post requests
    if (data instanceof FormData && url.includes('/posts')) {
      console.log(`API post to ${url} with FormData:`, {
        fields: Array.from(data.keys()),
        contentIncluded: data.has('content'),
        contentValue: data.get('content'),
        postImageIncluded: data.has('postImage'),
        postImageCount: Array.from(data.entries()).filter(([key]) => key === 'postImage').length
      });
    }
    
    // Debug logging for like toggle API calls
    if (url.includes('/likes/toggle')) {
      console.log(`API Like Toggle: ${url}`);
    }
    
    return apiClient.post(url, data, config).then(res => {
      // Special handling for like toggle responses
      if (url.includes('/likes/toggle')) {
        console.log(`Like Toggle Response for ${url}:`, res.data);
      }
      return res.data;
    });
  },
  
  patch: <T>(url: string, data?: any): Promise<ApiResponse<T>> =>
    apiClient.patch(url, data).then(res => res.data),
  
  delete: <T>(url: string, data?: any): Promise<ApiResponse<T>> =>
    data 
      ? apiClient.delete(url, { data }).then(res => res.data)
      : apiClient.delete(url).then(res => res.data),
      
  // Diagnostic function to inspect FormData
  debugFormData: async (formData: FormData): Promise<any> => {
    try {
      console.log('DEBUG FORMDATA:');
      console.log('Keys:', Array.from(formData.keys()));
      
      console.log('Entries:');
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File - ${value.name} (${value.type}, ${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
      
      // Check specifically for content field
      if (formData.has('content')) {
        console.log('Content field found:', formData.get('content'));
      } else {
        console.log('WARNING: No content field found in FormData');
      }
      
      // Check specifically for postImage field (expected by backend)
      if (formData.has('postImage')) {
        const postImageCount = Array.from(formData.entries()).filter(([key]) => key === 'postImage').length;
        console.log(`postImage field found with ${postImageCount} files`);
      } else {
        console.log('WARNING: No postImage field found in FormData');
      }
      
      return true;
    } catch (error) {
      console.error('FormData debug error:', error);
      return false;
    }
  }
}

export default api