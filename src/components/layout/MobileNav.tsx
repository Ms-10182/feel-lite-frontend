import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, User, Bookmark, Heart, Hash } from 'lucide-react'
import { cn } from '../../lib/utils'

const MobileNav: React.FC = () => {
  const location = useLocation()

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Hash, label: 'Trending', path: '/trending' },
    { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
    { icon: Heart, label: 'Liked', path: '/liked' },
    { icon: User, label: 'Profile', path: '/profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border pb-safe">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center space-y-1 px-2 py-1 rounded-lg transition-colors',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default MobileNav