import { NextResponse } from 'next/server'

// Mock user data (same as login)
const mockUsers = [
  {
    id: '1',
    email: 'admin@propertymanager.com',
    password: 'admin123',
    firstName: 'John',
    lastName: 'Admin',
    role: 'ADMIN',
    company: 'Property Management Co.',
    phone: '(555) 123-4567',
    isActive: true,
    createdAt: new Date('2025-01-01'),
    lastLogin: new Date('2025-10-19')
  },
  {
    id: '2',
    email: 'manager@propertymanager.com',
    password: 'manager123',
    firstName: 'Sarah',
    lastName: 'Manager',
    role: 'MANAGER',
    company: 'Property Management Co.',
    phone: '(555) 987-6543',
    isActive: true,
    createdAt: new Date('2025-02-15'),
    lastLogin: new Date('2025-10-18')
  },
  {
    id: '3',
    email: 'staff@propertymanager.com',
    password: 'staff123',
    firstName: 'Mike',
    lastName: 'Staff',
    role: 'STAFF',
    company: 'Property Management Co.',
    phone: '(555) 555-1234',
    isActive: true,
    createdAt: new Date('2025-03-10'),
    lastLogin: new Date('2025-10-17')
  }
]

export async function GET(request: Request) {
  try {
    // In a real app, you would validate the JWT token here
    // For now, we'll return the admin user as default
    const user = mockUsers[0]
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Return user data without password
    const { password, ...userWithoutPassword } = user
    
    return NextResponse.json({
      user: userWithoutPassword
    })
    
  } catch (error) {
    console.error('Profile error:', error)
    return NextResponse.json(
      { error: 'Failed to get user profile' },
      { status: 500 }
    )
  }
}