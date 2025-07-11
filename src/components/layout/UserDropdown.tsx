import React, { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { User, Settings, LogOut, Shield } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import ThemeToggle from '../ui/ThemeToggle'
import type { User as UserType } from '../../types'

interface UserDropdownProps {
  onClose: () => void
  user: UserType | null
}

const UserDropdown: React.FC<UserDropdownProps> = ({ onClose, user }) => {
  const { logout } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-10 w-56 bg-popover rounded-lg shadow-lg border border-border py-2 z-50"
    >
      {/* User Info */}
      <div className="px-4 py-2 border-b border-border">
        <p className="font-medium text-popover-foreground">{user?.username}</p>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </div>
      
      {/* Menu Items */}
      <div className="py-2">
        <Link
          to="/profile"
          onClick={onClose}
          className="flex items-center space-x-3 px-4 py-2 text-popover-foreground hover:bg-muted transition-colors"
        >
          <User className="h-4 w-4" />
          <span>Profile</span>
        </Link>
        
        <Link
          to="/settings"
          onClick={onClose}
          className="flex items-center space-x-3 px-4 py-2 text-popover-foreground hover:bg-muted transition-colors"
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Link>
        
        {/* Theme Toggle */}
        <div className="px-4 py-2">
          <ThemeToggle showLabel className="w-full justify-start" />
        </div>
        
        {user?.role === 'admin' && (
          <Link
            to="/admin"
            onClick={onClose}
            className="flex items-center space-x-3 px-4 py-2 text-popover-foreground hover:bg-muted transition-colors"
          >
            <Shield className="h-4 w-4" />
            <span>Admin Panel</span>
          </Link>
        )}
      </div>
      
      {/* Logout */}
      <div className="border-t border-border pt-2">
        <button
          onClick={() => {
            logout()
            onClose()
          }}
          className="flex items-center space-x-3 px-4 py-2 text-popover-foreground hover:bg-muted transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default UserDropdown