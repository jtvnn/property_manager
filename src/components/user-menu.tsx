'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'

export function UserMenu() {
  const { user, logout, isAuthenticated } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const pathname = usePathname()

  // Don't show user menu on login page or if not authenticated
  if (pathname === '/login' || !isAuthenticated || !user) {
    return null
  }

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'MANAGER': return 'bg-blue-100 text-blue-800'
      case 'STAFF': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 p-2"
      >
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </span>
        </div>
      </button>

      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsDropdownOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20 border">
            <div className="py-4 px-4">
              {/* User Info */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
              </div>

              {/* User Details */}
              <div className="border-t pt-4 mb-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Company:</span>
                  <span className="text-xs text-gray-900">{user.company}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Phone:</span>
                  <span className="text-xs text-gray-900">{user.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Last Login:</span>
                  <span className="text-xs text-gray-900">
                    {new Date(user.lastLogin).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Member Since:</span>
                  <span className="text-xs text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t pt-4 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    // In a real app, this would open a profile edit modal
                    alert('Profile editing would be implemented here')
                    setIsDropdownOpen(false)
                  }}
                >
                  Edit Profile
                </Button>
                
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}