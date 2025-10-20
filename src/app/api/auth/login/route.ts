import { NextResponse } from 'next/server'

// Mock user data
const mockUsers = [
  {
    id: '1',
    email: 'admin@propertymanager.com',
    password: 'admin123', // In real app, this would be hashed
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

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    // Find user by email
    const user = mockUsers.find(u => u.email === email && u.isActive)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    // Check password (in real app, compare hashed passwords)
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    // Update last login
    user.lastLogin = new Date()
    
    // Return user data without password
    const { password: _, ...userWithoutPassword } = user
    
    // In a real app, you would create a JWT token here
    const mockToken = `mock-jwt-token-${user.id}-${Date.now()}`
    
    return NextResponse.json({
      user: userWithoutPassword,
      token: mockToken,
      message: 'Login successful'
    })
    
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}