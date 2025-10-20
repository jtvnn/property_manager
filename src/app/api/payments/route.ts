import { NextResponse } from 'next/server'

// Mock payment data
const mockPayments = [
  {
    id: '1',
    amount: 1200,
    type: 'RENT',
    status: 'PAID',
    dueDate: '2025-10-01',
    paidDate: '2025-09-30',
    method: 'BANK_TRANSFER',
    notes: 'October rent payment',
    tenantId: '1',
    leaseId: '1',
    tenant: {
      firstName: 'John',
      lastName: 'Smith'
    },
    lease: {
      property: {
        name: 'Sunset Apartments - Unit 3A'
      }
    },
    createdAt: new Date('2025-09-30'),
    updatedAt: new Date('2025-09-30')
  },
  {
    id: '2',
    amount: 1200,
    type: 'RENT',
    status: 'PENDING',
    dueDate: '2025-11-01',
    method: null,
    notes: 'November rent payment',
    tenantId: '1',
    leaseId: '1',
    tenant: {
      firstName: 'John',
      lastName: 'Smith'
    },
    lease: {
      property: {
        name: 'Sunset Apartments - Unit 3A'
      }
    },
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-10-01')
  },
  {
    id: '3',
    amount: 1500,
    type: 'RENT',
    status: 'PAID',
    dueDate: '2025-10-01',
    paidDate: '2025-10-02',
    method: 'CHECK',
    notes: 'October rent payment',
    tenantId: '2',
    leaseId: '2',
    tenant: {
      firstName: 'Sarah',
      lastName: 'Johnson'
    },
    lease: {
      property: {
        name: 'Green Valley Homes - Unit B'
      }
    },
    createdAt: new Date('2025-10-02'),
    updatedAt: new Date('2025-10-02')
  },
  {
    id: '4',
    amount: 1500,
    type: 'RENT',
    status: 'OVERDUE',
    dueDate: '2025-11-01',
    method: null,
    notes: 'November rent payment - OVERDUE',
    tenantId: '2',
    leaseId: '2',
    tenant: {
      firstName: 'Sarah',
      lastName: 'Johnson'
    },
    lease: {
      property: {
        name: 'Green Valley Homes - Unit B'
      }
    },
    createdAt: new Date('2025-11-01'),
    updatedAt: new Date('2025-11-01')
  },
  {
    id: '5',
    amount: 50,
    type: 'LATE_FEE',
    status: 'PENDING',
    dueDate: '2025-11-05',
    method: null,
    notes: 'Late fee for November rent',
    tenantId: '2',
    leaseId: '2',
    tenant: {
      firstName: 'Sarah',
      lastName: 'Johnson'
    },
    lease: {
      property: {
        name: 'Green Valley Homes - Unit B'
      }
    },
    createdAt: new Date('2025-11-05'),
    updatedAt: new Date('2025-11-05')
  },
  {
    id: '6',
    amount: 800,
    type: 'RENT',
    status: 'PAID',
    dueDate: '2025-10-15',
    paidDate: '2025-10-14',
    method: 'CASH',
    notes: 'October rent payment',
    tenantId: '3',
    leaseId: '3',
    tenant: {
      firstName: 'Mike',
      lastName: 'Davis'
    },
    lease: {
      property: {
        name: 'Downtown Loft - Studio 12'
      }
    },
    createdAt: new Date('2025-10-14'),
    updatedAt: new Date('2025-10-14')
  }
]

export async function GET() {
  try {
    // Return all payments with tenant and property information
    return NextResponse.json(mockPayments)
  } catch (error) {
    console.error('Failed to fetch payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Create new payment
    const newPayment = {
      id: (mockPayments.length + 1).toString(),
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // In a real app, this would save to database
    mockPayments.push(newPayment)
    
    return NextResponse.json(newPayment, { status: 201 })
  } catch (error) {
    console.error('Failed to create payment:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}