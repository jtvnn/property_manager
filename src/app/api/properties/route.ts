import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock properties data
    const properties = [
      {
        id: '1',
        name: 'Sunset Apartments Unit 1A',
        address: '123 Main Street, Unit 1A',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
        type: 'APARTMENT',
        bedrooms: 2,
        bathrooms: 1.5,
        squareFeet: 950,
        description: 'Beautiful 2-bedroom apartment with modern amenities',
        imageUrl: null,
        rentAmount: 1200.00,
        status: 'OCCUPIED',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'Oak Hill House',
        address: '456 Oak Street',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62702',
        type: 'HOUSE',
        bedrooms: 3,
        bathrooms: 2,
        squareFeet: 1500,
        description: 'Spacious family home with backyard',
        imageUrl: null,
        rentAmount: 1800.00,
        status: 'AVAILABLE',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '3',
        name: 'Downtown Studio',
        address: '789 City Center Blvd',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62703',
        type: 'STUDIO',
        bedrooms: 0,
        bathrooms: 1,
        squareFeet: 600,
        description: 'Modern studio in the heart of downtown',
        imageUrl: null,
        rentAmount: 900.00,
        status: 'MAINTENANCE',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ]

    return NextResponse.json(properties)
  } catch (error) {
    console.error('Properties API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Mock property creation
    const newProperty = {
      id: Date.now().toString(),
      ...body,
      imageUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(newProperty, { status: 201 })
  } catch (error) {
    console.error('Create property error:', error)
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    )
  }
}