import { useInfiniteQuery } from '@tanstack/react-query'
import api from '../lib/api'

export function useTrendingPosts() {
  return useInfiniteQuery({
    queryKey: ['posts', 'trending'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get<any>('/posts/trending', {
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
  })
}
