import { NextResponse } from 'next/server'

export async function GET() {
  console.log('DASHBOARD API CALLED - FIXED VERSION')
  
  // Return response matching dashboard page expectations
  return NextResponse.json({
    metrics: {
      totalProperties: 2,
      occupiedProperties: 2,
      totalTenants: 2,
      pendingPayments: 1,
      openMaintenanceRequests: 1,
      occupancyRate: 100,
      totalMonthlyIncome: 1500
    },
    recentPayments: [
      {
        id: '1',
        amount: 750,
        type: 'rent',
        status: 'paid',
        dueDate: '2025-01-01',
        paidDate: '2024-12-28',
        tenant: {
          firstName: 'John',
          lastName: 'Smith'
        },
        lease: {
          property: {
            name: 'Sunset Apartments'
          }
        }
      }
    ],
    upcomingPayments: [
      {
        id: '2',
        amount: 750,
        type: 'rent',
        status: 'pending',
        dueDate: '2025-02-01',
        tenant: {
          firstName: 'Jane',
          lastName: 'Doe'
        },
        lease: {
          property: {
            name: 'Oak Hill Townhomes'
          }
        }
      }
    ]
  })
}