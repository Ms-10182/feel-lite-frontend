import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  age: z.number().min(16, 'You must be at least 16 years old'),
})

export const postSchema = z.object({
  content: z.string()
    .trim()
    .min(1, 'Content is required')
    .max(2000, 'Content must be less than 2000 characters'),
  tags: z.string().optional(),
  images: z.array(z.instanceof(File)).max(5, 'Maximum 5 images allowed').optional(),
})

export const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(500, 'Comment must be less than 500 characters'),
})

export const bookmarkSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(250, 'Description must be less than 250 characters').optional(),
})

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const updateEmailSchema = z.object({
  newEmail: z.string().email('Please enter a valid email address'),
})

export const banUserSchema = z.object({
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason must be less than 500 characters'),
  duration: z.number().min(1, 'Duration must be at least 1 hour').optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type PostFormData = z.infer<typeof postSchema>
export type CommentFormData = z.infer<typeof commentSchema>
export type BookmarkFormData = z.infer<typeof bookmarkSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type UpdateEmailFormData = z.infer<typeof updateEmailSchema>
export type BanUserFormData = z.infer<typeof banUserSchema>