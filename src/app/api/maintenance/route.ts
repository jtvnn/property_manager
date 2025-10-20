import { NextResponse } from 'next/server'

// Mock maintenance request data
const mockMaintenanceRequests = [
  {
    id: '1',
    title: 'Leaky Faucet in Kitchen',
    description: 'The kitchen faucet has been dripping constantly for the past week. It\'s getting worse and wasting water.',
    category: 'PLUMBING',
    priority: 'MEDIUM',
    status: 'OPEN',
    tenantId: '1',
    propertyId: '1',
    assignedTo: null,
    estimatedCost: 150,
    actualCost: null,
    requestedDate: '2025-10-15',
    scheduledDate: null,
    completedDate: null,
    notes: 'Tenant reports constant dripping, may need new faucet parts',
    tenant: {
      firstName: 'John',
      lastName: 'Smith',
      phone: '(555) 123-4567',
      email: 'john.smith@email.com'
    },
    property: {
      name: 'Sunset Apartments - Unit 3A',
      address: '123 Sunset Blvd, Apt 3A'
    },
    createdAt: new Date('2025-10-15'),
    updatedAt: new Date('2025-10-15')
  },
  {
    id: '2',
    title: 'Broken Dishwasher',
    description: 'Dishwasher stopped working completely. No power, won\'t turn on. Checked circuit breaker and it\'s fine.',
    category: 'APPLIANCE',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    tenantId: '2',
    propertyId: '2',
    assignedTo: 'Mike\'s Appliance Repair',
    estimatedCost: 300,
    actualCost: null,
    requestedDate: '2025-10-12',
    scheduledDate: '2025-10-20',
    completedDate: null,
    notes: 'Scheduled repair with Mike\'s Appliance Repair for Oct 20th',
    tenant: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '(555) 987-6543',
      email: 'sarah.johnson@email.com'
    },
    property: {
      name: 'Green Valley Homes - Unit B',
      address: '456 Green Valley Dr, Unit B'
    },
    createdAt: new Date('2025-10-12'),
    updatedAt: new Date('2025-10-17')
  },
  {
    id: '3',
    title: 'HVAC System Not Heating',
    description: 'Heating system is not working properly. Temperature won\'t go above 65°F even when set to 75°F.',
    category: 'HVAC',
    priority: 'HIGH',
    status: 'SCHEDULED',
    tenantId: '1',
    propertyId: '1',
    assignedTo: 'CoolAir HVAC Services',
    estimatedCost: 450,
    actualCost: null,
    requestedDate: '2025-10-10',
    scheduledDate: '2025-10-21',
    completedDate: null,
    notes: 'Emergency HVAC repair scheduled. Tenant has space heater as temporary solution.',
    tenant: {
      firstName: 'John',
      lastName: 'Smith',
      phone: '(555) 123-4567',
      email: 'john.smith@email.com'
    },
    property: {
      name: 'Sunset Apartments - Unit 3A',
      address: '123 Sunset Blvd, Apt 3A'
    },
    createdAt: new Date('2025-10-10'),
    updatedAt: new Date('2025-10-18')
  },
  {
    id: '4',
    title: 'Ceiling Light Fixture Loose',
    description: 'Living room ceiling light fixture is loose and wobbling. Concerned it might fall.',
    category: 'ELECTRICAL',
    priority: 'MEDIUM',
    status: 'COMPLETED',
    tenantId: '3',
    propertyId: '3',
    assignedTo: 'Bright Electric Co.',
    estimatedCost: 100,
    actualCost: 85,
    requestedDate: '2025-10-05',
    scheduledDate: '2025-10-08',
    completedDate: '2025-10-08',
    notes: 'Fixed loose mounting bracket and replaced worn screws. Fixture is now secure.',
    tenant: {
      firstName: 'Mike',
      lastName: 'Davis',
      phone: '(555) 555-1234',
      email: 'mike.davis@email.com'
    },
    property: {
      name: 'Downtown Loft - Studio 12',
      address: '789 Downtown Ave, Studio 12'
    },
    createdAt: new Date('2025-10-05'),
    updatedAt: new Date('2025-10-08')
  },
  {
    id: '5',
    title: 'Garbage Disposal Jammed',
    description: 'Kitchen garbage disposal is jammed and making grinding noises. Won\'t turn on properly.',
    category: 'PLUMBING',
    priority: 'LOW',
    status: 'OPEN',
    tenantId: '2',
    propertyId: '2',
    assignedTo: null,
    estimatedCost: 120,
    actualCost: null,
    requestedDate: '2025-10-18',
    scheduledDate: null,
    completedDate: null,
    notes: 'Tenant advised to avoid using disposal until repair. Low priority as kitchen sink still functional.',
    tenant: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '(555) 987-6543',
      email: 'sarah.johnson@email.com'
    },
    property: {
      name: 'Green Valley Homes - Unit B',
      address: '456 Green Valley Dr, Unit B'
    },
    createdAt: new Date('2025-10-18'),
    updatedAt: new Date('2025-10-18')
  },
  {
    id: '6',
    title: 'Window Won\'t Close Properly',
    description: 'Bedroom window is stuck and won\'t close completely. Security concern and energy efficiency issue.',
    category: 'GENERAL',
    priority: 'MEDIUM',
    status: 'CANCELLED',
    tenantId: '3',
    propertyId: '3',
    assignedTo: null,
    estimatedCost: 200,
    actualCost: 0,
    requestedDate: '2025-10-01',
    scheduledDate: null,
    completedDate: null,
    notes: 'Tenant found DIY solution and fixed the issue themselves. Request cancelled.',
    tenant: {
      firstName: 'Mike',
      lastName: 'Davis',
      phone: '(555) 555-1234',
      email: 'mike.davis@email.com'
    },
    property: {
      name: 'Downtown Loft - Studio 12',
      address: '789 Downtown Ave, Studio 12'
    },
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-10-03')
  }
]

export async function GET() {
  try {
    // Return all maintenance requests with tenant and property information
    return NextResponse.json(mockMaintenanceRequests)
  } catch (error) {
    console.error('Failed to fetch maintenance requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch maintenance requests' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Create new maintenance request
    const newRequest = {
      id: (mockMaintenanceRequests.length + 1).toString(),
      ...body,
      status: 'OPEN',
      requestedDate: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // In a real app, this would save to database
    mockMaintenanceRequests.push(newRequest)
    
    return NextResponse.json(newRequest, { status: 201 })
  } catch (error) {
    console.error('Failed to create maintenance request:', error)
    return NextResponse.json(
      { error: 'Failed to create maintenance request' },
      { status: 500 }
    )
  }
}