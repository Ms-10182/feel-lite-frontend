import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  User, 
  Bookmark, 
  Heart, 
  Hash, 
  Settings, 
  LogOut,
  X,
  Shield
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

interface SidebarProps {
  onClose?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ onClose, collapsed = false, onToggleCollapse }) => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
    { icon: Heart, label: 'Liked Posts', path: '/liked' },
    { icon: Hash, label: 'Trending', path: '/trending' },
  ]

  if (user?.role === 'admin') {
    menuItems.push({ icon: Shield, label: 'Admin Panel', path: '/admin' })
  }

  return (
    <div className={cn(
      "h-screen bg-card border-r border-border fixed top-16 left-0 z-20 transition-all duration-300 ease-in-out",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Mobile Header - only show when not collapsed */}
      {onClose && !collapsed && (
        <div className="flex items-center justify-between p-4 border-b border-border lg:hidden">
          <span className="font-semibold text-card-foreground">Menu</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}
      
      {/* Navigation */}
      <nav className="p-4 pt-6">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  'flex items-center px-3 py-2 rounded-lg transition-all duration-200 group relative',
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  collapsed ? 'justify-center' : 'space-x-3'
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="font-medium transition-opacity duration-200">
                    {item.label}
                  </span>
                )}
                
                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            )
          })}
        </div>
        
        {/* Logout */}
        <div className="mt-8 pt-4 border-t border-border">
          <button
            onClick={() => {
              logout()
              onClose?.()
            }}
            className={cn(
              'flex items-center px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all w-full group relative',
              collapsed ? 'justify-center' : 'space-x-3'
            )}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && (
              <span className="font-medium transition-opacity duration-200">
                Logout
              </span>
            )}
            
            {/* Tooltip for collapsed state */}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Logout
              </div>
            )}
          </button>
        </div>
      </nav>
    </div>
  )
}

export default Sidebar