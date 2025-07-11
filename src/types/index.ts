export interface User {
  _id: string
  username: string
  email: string
  avatar: string
  coverImage: string
  role: 'user' | 'admin'
  isBanned?: boolean
  banReason?: string
  banExpiresAt?: string
  createdAt: string
  updatedAt: string
}

export interface Post {
  _id: string
  content: string
  owner: {
    _id: string
    username: string
    avatar: string
  }
  tags: string[]
  images: string[]
  isArchived: boolean
  totalLikes: number
  isLiked: boolean
  isBookmarked: boolean
  createdAt: string
  updatedAt: string
}

export interface Comment {
  _id: string
  content: string
  owner: {
    _id: string
    username: string
    avatar: string
  }
  post: string
  totalLikes?: number
  isLiked?: boolean
  createdAt: string
  updatedAt: string
}

export interface Thread {
  _id: string
  content: string
  owner: {
    _id: string
    username: string
    avatar: string
  }
  comment: string
  totalLikes?: number
  isLiked?: boolean
  createdAt: string
  updatedAt: string
}

export interface Like {
  _id: string
  likedBy: string
  post?: string
  comment?: string
  createdAt: string
}

export interface Bookmark {
  _id: string
  title: string
  description: string
  owner: string
  createdAt: string
}

export interface BookmarkedPost {
  _id: string
  post: Post
  bookmark: string
  createdAt: string
}

export interface ApiResponse<T> {
  statusCode: number
  data: T
  message: string
  success: boolean
}

export interface PaginatedResponse<T> {
  docs: T[]
  totalDocs: number
  limit: number
  page: number
  totalPages: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface CreatePostData {
  content: string
  tags?: string
  images?: File[]
}

export interface CreateCommentData {
  content: string
}

export interface CreateBookmarkData {
  title: string
  description?: string
}

export interface BanUserData {
  reason: string
  duration?: number
}

export interface UpdateUserData {
  newEmail?: string
  avatarIdx?: number
  coverImageIdx?: number
}

export interface ChangePasswordData {
  oldPassword: string
  newPassword: string
}

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  age: number
}

export interface LikedPost {
  postId: string
  content: string
  createdAt: string
  updatedAt?: string
  images?: string[]
  totalLikes?: number
  isLiked?: boolean
  owner?: {
    _id: string
    username: string
    avatar: string
  }
}