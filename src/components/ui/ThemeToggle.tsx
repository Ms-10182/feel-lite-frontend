import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { Button } from './Button'

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  showLabel = false 
}) => {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size={showLabel ? "sm" : "icon"}
      onClick={toggleTheme}
      className={`transition-all duration-200 hover:scale-105 ${className}`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <>
          <Moon className="h-5 w-5" />
          {showLabel && <span className="ml-2">Dark Mode</span>}
        </>
      ) : (
        <>
          <Sun className="h-5 w-5" />
          {showLabel && <span className="ml-2">Light Mode</span>}
        </>
      )}
    </Button>
  )
}

export default ThemeToggle
