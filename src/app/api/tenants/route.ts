import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock tenants data
    const tenants = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        phone: '(555) 123-4567',
        dateOfBirth: '1985-03-15',
        emergencyContactName: 'Jane Smith',
        emergencyContactPhone: '(555) 987-6543',
        notes: 'Excellent tenant, always pays on time',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        leases: [
          {
            id: '1',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            monthlyRent: 1200,
            securityDeposit: 1200,
            status: 'ACTIVE',
            propertyId: '1',
            property: {
              id: '1',
              name: 'Sunset Apartments Unit 1A',
              address: '123 Main Street, Unit 1A',
              city: 'Springfield',
              state: 'IL',
              zipCode: '62701'
            }
          }
        ]
      },
      {
        id: '2',
        firstName: 'Emily',
        lastName: 'Johnson',
        email: 'emily.johnson@email.com',
        phone: '(555) 234-5678',
        dateOfBirth: '1990-07-22',
        emergencyContactName: 'Mike Johnson',
        emergencyContactPhone: '(555) 876-5432',
        notes: 'New tenant, moved in last month',
        createdAt: '2024-09-01T00:00:00Z',
        updatedAt: '2024-09-01T00:00:00Z',
        leases: [
          {
            id: '2',
            startDate: '2024-09-01',
            endDate: '2025-08-31',
            monthlyRent: 1800,
            securityDeposit: 1800,
            status: 'ACTIVE',
            propertyId: '2',
            property: {
              id: '2',
              name: 'Oak Hill House',
              address: '456 Oak Street',
              city: 'Springfield',
              state: 'IL',
              zipCode: '62702'
            }
          }
        ]
      },
      {
        id: '3',
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@email.com',
        phone: '(555) 345-6789',
        dateOfBirth: '1988-11-10',
        emergencyContactName: 'Sarah Brown',
        emergencyContactPhone: '(555) 765-4321',
        notes: 'Previous tenant, lease ended last month',
        createdAt: '2023-06-01T00:00:00Z',
        updatedAt: '2024-09-30T00:00:00Z',
        leases: [
          {
            id: '3',
            startDate: '2023-06-01',
            endDate: '2024-05-31',
            monthlyRent: 900,
            securityDeposit: 900,
            status: 'EXPIRED',
            propertyId: '3',
            property: {
              id: '3',
              name: 'Downtown Studio',
              address: '789 City Center Blvd',
              city: 'Springfield',
              state: 'IL',
              zipCode: '62703'
            }
          }
        ]
      }
    ]

    return NextResponse.json(tenants)
  } catch (error) {
    console.error('Tenants API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tenants' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Mock tenant creation
    const newTenant = {
      id: Date.now().toString(),
      ...body,
      leases: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(newTenant, { status: 201 })
  } catch (error) {
    console.error('Create tenant error:', error)
    return NextResponse.json(
      { error: 'Failed to create tenant' },
      { status: 500 }
    )
  }
}