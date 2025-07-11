import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { cn } from '../../lib/utils'
import Header from './Header'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Load saved sidebar state from localStorage
    const saved = localStorage.getItem('sidebarCollapsed')
    return saved ? JSON.parse(saved) : false
  })

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed))
  }, [sidebarCollapsed])

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onMenuClick={() => setSidebarOpen(true)}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        sidebarCollapsed={sidebarCollapsed}
      />
      
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar 
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
        
        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="lg:hidden">
            <div 
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card shadow-xl border-r border-border">
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}
        
        {/* Main Content */}
        <main className={cn(
          "flex-1 pt-16 transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        )}>
          <div className="mx-auto px-3 xs:px-4 py-5 xs:py-6 sm:py-8 max-w-4xl">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <MobileNav />
      </div>
    </div>
  )
}

export default Layout