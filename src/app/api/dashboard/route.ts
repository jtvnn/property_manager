import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock data for testing the API routing
    const mockData = {
      metrics: {
        totalProperties: 2,
        occupiedProperties: 1,
        totalTenants: 2,
        pendingPayments: 1,
        openMaintenanceRequests: 1,
        occupancyRate: 50,
        totalMonthlyIncome: 1200
      },
      recentPayments: [
        {
          id: '1',
          amount: 1200,
          type: 'RENT',
          status: 'PAID',
          dueDate: '2024-10-01',
          paidDate: '2024-09-28',
          tenant: {
            firstName: 'John',
            lastName: 'Smith'
          },
          lease: {
            property: {
              name: 'Sunset Apartments Unit 1A'
            }
          }
        }
      ],
      upcomingPayments: [
        {
          id: '2',
          amount: 1200,
          type: 'RENT',
          status: 'PENDING',
          dueDate: '2024-11-01',
          tenant: {
            firstName: 'John',
            lastName: 'Smith'
          },
          lease: {
            property: {
              name: 'Sunset Apartments Unit 1A'
            }
          }
        }
      ]
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}