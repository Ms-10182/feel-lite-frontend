import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Search, Bell, Plus, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import Avatar from '../ui/Avatar'
import ThemeToggle from '../ui/ThemeToggle'
import UserDropdown from './UserDropdown'

interface HeaderProps {
  onMenuClick: () => void
  onToggleSidebar?: () => void
  sidebarCollapsed?: boolean
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onToggleSidebar, sidebarCollapsed }) => {
  const { user } = useAuth()
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Desktop sidebar toggle */}
          {onToggleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="hidden lg:flex"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </Button>
          )}
          
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-bold text-sm">FL</span>
            </div>
            <span className="font-bold text-xl text-foreground hidden sm:block">
              Feel-Lite
            </span>
          </Link>
        </div>
        
        {/* Center Section - Search */}
        <div className="flex-1 max-w-lg mx-4">
          <form
            onSubmit={e => {
              e.preventDefault()
              if (searchQuery.trim()) {
                navigate(`/hashtag/${encodeURIComponent(searchQuery.trim())}`)
                setSearchQuery('')
              }
            }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search hashtags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input bg-background/50 text-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                onKeyDown={e => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    e.preventDefault()
                    navigate(`/hashtag/${encodeURIComponent(searchQuery.trim())}`)
                    setSearchQuery('')
                  }
                }}
              />
            </div>
          </form>
        </div>
        
        {/* Right Section */}
        <div className="flex items-center space-x-2">
          <ThemeToggle className="hidden sm:flex" />
          
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Bell className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Plus className="h-5 w-5" />
          </Button>
          
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="p-1 rounded-full hover:bg-muted transition-colors"
            >
              <Avatar
                src={user?.avatar}
                alt={user?.username}
                fallback={user?.username?.charAt(0)}
                size="sm"
              />
            </button>
            
            {showUserDropdown && (
              <UserDropdown 
                onClose={() => setShowUserDropdown(false)}
                user={user}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header