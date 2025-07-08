'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Sidebar } from './Sidebar'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-hidden"
        >
          <div className="h-full overflow-auto custom-scrollbar">
            {children}
          </div>
        </motion.main>
      </div>
    </ProtectedRoute>
  )
}

