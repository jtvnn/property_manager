'use client'

import { useAuth } from '@/contexts/auth-context'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface AuthWrapperProps {
  children: React.ReactNode
}

// Pages that don't require authentication
const publicPages = ['/login', '/']

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const pathname = usePathname()

  useEffect(() => {
    // Don't redirect if still loading or on public pages
    if (isLoading || publicPages.includes(pathname)) {
      return
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      window.location.href = '/login'
    }
  }, [isAuthenticated, isLoading, pathname])

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login page if not authenticated and not on public pages
  if (!isAuthenticated && !publicPages.includes(pathname)) {
    return null // Will redirect via useEffect
  }

  return <>{children}</>
}