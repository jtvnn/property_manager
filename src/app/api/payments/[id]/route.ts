import { NextResponse } from 'next/server'

// Mock payment data (same as in the main route)
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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const paymentIndex = mockPayments.findIndex(p => p.id === params.id)
    
    if (paymentIndex === -1) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }
    
    // Update payment
    mockPayments[paymentIndex] = {
      ...mockPayments[paymentIndex],
      ...body,
      updatedAt: new Date()
    }
    
    return NextResponse.json(mockPayments[paymentIndex])
  } catch (error) {
    console.error('Failed to update payment:', error)
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const paymentIndex = mockPayments.findIndex(p => p.id === params.id)
    
    if (paymentIndex === -1) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }
    
    // Remove payment
    mockPayments.splice(paymentIndex, 1)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete payment:', error)
    return NextResponse.json(
      { error: 'Failed to delete payment' },
      { status: 500 }
    )
  }
}