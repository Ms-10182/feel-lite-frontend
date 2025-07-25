import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../lib/api'
import type { Post, PaginatedResponse, CreatePostData } from '../types'

export function useRecommendedPosts() {
  return useInfiniteQuery({
    queryKey: ['posts', 'recommended'],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        // Make the API call to get recommended posts
        const response = await api.get<any>('/posts/feed/recommended')
        
        // Log the response for debugging
        console.log('Recommended posts API response:', response.data);
        
        // Check for different response structures
        let posts: any[] = [];
        let preferredTags: any[] = [];
        
        // Case 1: Direct {posts: [...], preferredTags: [...]} structure
        if (response.data && Array.isArray(response.data.posts)) {
          posts = response.data.posts;
          preferredTags = response.data.preferredTags || [];
        } 
        // Case 2: {data: {posts: [...], preferredTags: [...]}} structure
        else if (response.data?.data && Array.isArray(response.data.data.posts)) {
          posts = response.data.data.posts;
          preferredTags = response.data.data.preferredTags || [];
        }
        // Case 3: Direct array of posts
        else if (Array.isArray(response.data)) {
          posts = response.data;
        }
        
        if (posts.length > 0) {
          // Transform posts to ensure all required fields are present
          const transformedPosts = posts.map((post: any) => ({
            ...post,
            // Ensure required Post fields are present with defaults
            isArchived: post.isArchived ?? false,
            updatedAt: post.updatedAt ?? post.createdAt,
            totalLikes: post.totalLikes ?? 0,
            isLiked: post.isLiked ?? false,
            isBookmarked: post.isBookmarked ?? false,
            tags: post.tags ?? [],
            images: post.images ?? []
          }));

          // Return in paginated format for consistency with other feeds
          return {
            docs: transformedPosts,
            totalDocs: transformedPosts.length,
            limit: 20,
            totalPages: 1,
            page: pageParam,
            pagingCounter: 1,
            hasPrevPage: false,
            hasNextPage: false, // No pagination supported for recommended posts
            prevPage: null,
            nextPage: null,
            preferredTags: preferredTags
          }
        } else {
          console.error('Unexpected response format from recommended posts API:', response.data);
          
          // Return empty data in the expected format
          return {
            docs: [],
            totalDocs: 0,
            limit: 20,
            totalPages: 1,
            page: pageParam,
            pagingCounter: 1,
            hasPrevPage: false,
            hasNextPage: false,
            prevPage: null,
            nextPage: null,
            preferredTags: []
          }
        }
      } catch (error) {
        console.error('Error fetching recommended posts:', error);
        throw error;
      }
    },
    getNextPageParam: () => undefined, // No pagination for now
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3 // Retry up to 3 times on failure
  })
}

export function useHashtagPosts(hashtag: string) {
  return useInfiniteQuery({
    queryKey: ['posts', 'hashtag', hashtag],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get<any>(`/posts/hashtag/${hashtag}`, {
        params: {
          page: pageParam,
          limit: 20,
        }
      })
      
      // Handle the API response format: {statusCode, data: {docs, totalDocs, ...}, message, success}
      if (response.data && response.data.data) {
        return response.data.data
      }
      
      // Fallback for different response structure
      return response.data
    },
    getNextPageParam: (lastPage) => 
      lastPage.hasNextPage ? lastPage.nextPage : undefined,
    initialPageParam: 1,
    enabled: !!hashtag, // Only run query if hashtag is provided
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreatePostData) => {
      console.log('CreatePost data:', data) // Debug log
      
      // Check if we have images to upload
      if (data.images && data.images.length > 0) {
        console.log('Has images, using FormData approach with postImage field')
        
        // Create FormData matching exactly what the backend expects
        const formData = new FormData()
        
        // Add content field - this is the most important field
        formData.append('content', data.content)
        console.log('Added content to FormData:', data.content)
        
        // Add tags if present
        if (data.tags) {
          formData.append('tags', data.tags)
        }

        // Add images with the exact field name expected by the backend: postImage
        // Backend uses: upload.array("postImage", 5)
        data.images.forEach((image) => {
          formData.append('postImage', image)
        })

        // Log complete FormData contents for debugging
        console.log('FormData contents:')
        for (const [key, value] of formData.entries()) {
          if (value instanceof File) {
            console.log(`${key}: File - ${value.name} (${value.type}, ${value.size} bytes)`)
          } else {
            console.log(`${key}: ${value}`)
          }
        }
        
        try {
          // Send the request with the correctly formatted FormData
          console.log('Sending FormData with postImage field name')
          const response = await api.post<Post>('/posts', formData)
          return response.data
        } catch (error: any) {
          console.error('FormData post attempt failed:', error.response?.data || error.message)
          
          // If we get a specific error about content being required, try a fallback approach
          if (error.response?.status === 400 && error.response?.data?.message === 'Content is required') {
            console.log('Trying fallback approach with restructured FormData')
            
            const fallbackFormData = new FormData()
            
            // Try adding content in different ways
            fallbackFormData.append('content', data.content)
            
            // Some APIs expect JSON data in a specific field
            fallbackFormData.append('postData', JSON.stringify({
              content: data.content,
              ...(data.tags && { tags: data.tags })
            }))
            
            if (data.tags) {
              fallbackFormData.append('tags', data.tags)
            }
            
            // Still use the correct field name for images
            data.images.forEach((image) => {
              fallbackFormData.append('postImage', image)
            })
            
            // Log the fallback attempt
            console.log('Fallback FormData contents:')
            for (const [key, value] of fallbackFormData.entries()) {
              if (value instanceof File) {
                console.log(`${key}: File - ${value.name} (${value.type}, ${value.size} bytes)`)
              } else {
                console.log(`${key}: ${value}`)
              }
            }
            
            const fallbackResponse = await api.post<Post>('/posts', fallbackFormData)
            return fallbackResponse.data
          }
          
          throw error
        }
      } else {
        // No images, use regular JSON
        console.log('No images, using JSON payload')
        const jsonPayload = {
          content: data.content,
          ...(data.tags && { tags: data.tags }),
        }
        
        const response = await api.post<Post>('/posts', jsonPayload)
        return response.data
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('Post created successfully!')
    },
    onError: (error: any) => {
      console.error('CreatePost error:', error) // Debug log
      console.error('Error response:', error.response?.data) // Debug log
      const message = error.response?.data?.message || 'Failed to create post'
      toast.error(message)
    },
  })
}

export function useUpdatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ postId, data }: { postId: string; data: { content: string; tags?: string } }) => {
      console.log(`Attempting direct PATCH to /posts/${postId} with:`, data);
      
      // Very simple approach - just send what the backend expects
      const finalData = {
        content: data.content,
        tags: data.tags || ''
      };
      
      // Direct API call with minimal processing
      const response = await api.patch<Post>(`/posts/${postId}`, finalData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post updated successfully!');
    },
    onError: (error: any) => {
      console.error('Update post error:', error);
      const message = error.response?.data?.message || 'Failed to update post';
      toast.error(message);
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId: string) => {
      await api.delete(`/posts/${postId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('Post deleted successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete post'
      toast.error(message)
    },
  })
}

export function useArchivePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ postId, archive }: { postId: string; archive: boolean }) => {
      const endpoint = archive ? `/posts/${postId}/archive` : `/posts/${postId}/unarchive`
      await api.patch(endpoint)
    },
    onSuccess: (_, { archive }) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success(archive ? 'Post archived successfully!' : 'Post unarchived successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Operation failed'
      toast.error(message)
    },
  })
}

export function useMyPosts() {
  return useInfiniteQuery({
    queryKey: ['posts', 'my-posts'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get<PaginatedResponse<Post>>('/posts/my-posts', {
        page: pageParam,
        limit: 20,
      })
      return response.data
    },
    getNextPageParam: (lastPage) => 
      lastPage.hasNextPage ? lastPage.nextPage : undefined,
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useArchivedPosts() {
  return useInfiniteQuery({
    queryKey: ['posts', 'archived'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get<PaginatedResponse<Post>>('/posts/archived-posts', {
        page: pageParam,
        limit: 20,
      })
      return response.data
    },
    getNextPageParam: (lastPage) => 
      lastPage.hasNextPage ? lastPage.nextPage : undefined,
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry more than twice for 404 errors (no archived posts)
      if (error?.response?.status === 404) return failureCount < 2
      // For other errors, retry up to 3 times
      return failureCount < 3
    }
  })
}

export function useBulkUnarchivePosts() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postIds: string[]) => {
      // Process unarchive requests in parallel
      const promises = postIds.map(postId => 
        api.patch(`/posts/${postId}/unarchive`)
      )
      await Promise.all(promises)
      return postIds
    },
    onSuccess: (postIds) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success(`${postIds.length} post${postIds.length > 1 ? 's' : ''} unarchived successfully!`)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Bulk unarchive failed'
      toast.error(message)
    },
  })
}

export function usePost(postId: string | null) {
  return useQuery({
    queryKey: ['posts', postId],
    queryFn: async () => {
      if (!postId) return null
      
      try {
        const response = await api.get<any>(`/posts/p/${postId}`)
        
        console.log('Post response:', response.data); // Debug log
        
        // Check if the response has data array (the updated format)
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const post = response.data[0];
          
          // Transform the response to match the Post type
          // The API now includes totalLikes and isLiked, only provide defaults if missing
          return {
            ...post,
            isArchived: post.isArchived ?? false,
            updatedAt: post.updatedAt ?? post.createdAt
          } as Post;
        }
        
        console.error('Unexpected post response format:', response);
        return null;
      } catch (error) {
        console.error('Error fetching post:', error);
        throw error;
      }
    },
    enabled: !!postId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if it's a 404
      if (error?.response?.status === 404) return false
      return failureCount < 3
    },
  })
}

export function useGlobalFeed() {
  return useInfiniteQuery({
    queryKey: ['posts', 'global'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get<any>('/posts/feed/global', {
        page: pageParam,
        limit: 20,
      })
      
      // Check for different response structures
      let posts: any[] = [];
      
      if (response.data?.data?.posts) {
        // Handle nested structure
        posts = response.data.data.posts;
      } else if (response.data?.posts) {
        // Handle direct posts array
        posts = response.data.posts;
      } else if (Array.isArray(response.data)) {
        // Handle direct array
        posts = response.data;
      } else if (response.data?.docs) {
        // Handle paginated response
        posts = response.data.docs;
      }
      
      if (posts.length > 0) {
        // Transform posts to ensure all required fields are present
        const transformedPosts = posts.map((post: any) => ({
          ...post,
          // Ensure required Post fields are present with defaults
          isArchived: post.isArchived ?? false,
          updatedAt: post.updatedAt ?? post.createdAt,
          totalLikes: post.totalLikes ?? 0,
          isLiked: post.isLiked ?? false,
          isBookmarked: post.isBookmarked ?? false,
          tags: post.tags ?? [],
          images: post.images ?? []
        }));
        
        // If the response was already in paginated format, preserve it
        if (response.data?.totalDocs) {
          return {
            ...response.data,
            docs: transformedPosts
          };
        }
        
        // Otherwise, create a paginated format
        return {
          docs: transformedPosts,
          totalDocs: transformedPosts.length,
          limit: 20,
          totalPages: 1,
          page: pageParam,
          pagingCounter: 1,
          hasPrevPage: false,
          hasNextPage: false,
          prevPage: null,
          nextPage: null
        };
      }
      
      // Return the original response if we couldn't parse it
      return response.data;
    },
    getNextPageParam: (lastPage) => 
      lastPage.hasNextPage ? lastPage.nextPage : undefined,
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}