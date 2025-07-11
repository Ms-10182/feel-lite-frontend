import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  const now = new Date()
  const targetDate = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}d ago`
  }

  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7)
    return `${weeks}w ago`
  }

  return targetDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[\w]+/g
  const matches = text.match(hashtagRegex)
  return matches ? matches.map(tag => tag.slice(1)) : []
}

export function processHashtags(text: string): string {
  return text.replace(/#([\w]+)/g, (match, hashtag) => {
    return `<a href="/hashtag/${hashtag}" class="text-primary font-medium hover:text-primary/80 transition-colors cursor-pointer" onclick="event.stopPropagation()">#${hashtag}</a>`
  })
}

export function validateFileType(file: File): boolean {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/heic']
  return allowedTypes.includes(file.type.toLowerCase())
}

export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

export function generatePlaceholder(width: number, height: number): string {
  return `https://via.placeholder.com/${width}x${height}/E5E7EB/9CA3AF?text=Image`
}