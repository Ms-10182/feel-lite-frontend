import React from 'react'
import { cn } from '../../lib/utils'

interface AvatarProps {
  src?: string
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const Avatar: React.FC<AvatarProps> = ({ src, alt, fallback, size = 'md', className }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  }

  const initials = fallback || alt?.charAt(0).toUpperCase() || '?'
  
  // Ensure the avatar URL is properly formed
  const getAvatarUrl = (url?: string) => {
    if (!url) return undefined;
    
    // If it's already an absolute URL, return it as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If it's just a file name (e.g., avatar5.png), use the API base URL
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
    return `${apiBaseUrl}/assets/avatars/${url}`;
  };

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full bg-muted font-medium text-muted-foreground overflow-hidden',
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <img
          src={getAvatarUrl(src)}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            // Show fallback
            const parent = target.parentElement;
            if (parent) {
              const fallbackSpan = document.createElement('span');
              fallbackSpan.textContent = initials;
              parent.appendChild(fallbackSpan);
            }
          }}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}

export default Avatar