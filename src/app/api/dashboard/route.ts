import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface Property {
  id: string
  name: string
  address: string
  type: string
  bedrooms: number
  bathrooms: number
  rent: number
  status: string
}

interface Tenant {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

interface Lease {
  id: string
  propertyId: string
  tenantId: string
  startDate: string
  endDate: string
  monthlyRent: number
  securityDeposit: number
  status: string
  tenant?: Tenant
  property?: Property
  payments?: Payment[]
}

interface Payment {
  id: string
  leaseId: string
  tenantId: string
  amount: number
  dueDate: string
  paidDate?: string
  status: string
  type: string
  method?: string
  notes?: string
}

interface MaintenanceRequest {
  id: string
  propertyId: string
  tenantId?: string
  title: string
  description: string
  priority: string
  status: string
  dateReported: string
  dateCompleted?: string
}

const dataPath = path.join(process.cwd(), 'data')

function readJsonFile(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(content)
    }
    return []
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error)
    return []
  }
}

export async function GET() {
  console.log('=== DASHBOARD API CALLED - FIXED PENDING PAYMENTS VERSION ===')
  
  try {
    // Read data files
    const properties = readJsonFile(path.join(dataPath, 'properties.json')) as Property[]
    const tenants = readJsonFile(path.join(dataPath, 'tenants.json')) as Tenant[]
    const leases = readJsonFile(path.join(dataPath, 'leases.json')) as Lease[]
    const allPayments = readJsonFile(path.join(dataPath, 'payments.json')) as Payment[]
    const maintenance = readJsonFile(path.join(dataPath, 'maintenance.json')) as MaintenanceRequest[]

    console.log(`Loaded: ${properties.length} properties, ${tenants.length} tenants, ${leases.length} leases`)
    console.log('DEBUG: About to filter payments by current month')

    // Calculate metrics
    const totalProperties = properties.length
    const totalTenants = tenants.length
    const activeLeases = leases.filter(lease => lease.status === 'ACTIVE')
    
    // Calculate occupied properties - count unique properties with active leases
    const occupiedPropertyIds = new Set(activeLeases.map(lease => lease.propertyId))
    const occupiedProperties = occupiedPropertyIds.size
    
    console.log('Active leases:', activeLeases.map(l => `${l.id} (property: ${l.propertyId})`))
    console.log('Unique occupied property IDs:', Array.from(occupiedPropertyIds))
    
    const occupancyRate = totalProperties > 0 ? Math.round((occupiedProperties / totalProperties) * 100) : 0
    const totalMonthlyIncome = activeLeases.reduce((sum, lease) => sum + lease.monthlyRent, 0)
    
    // Get payments - use embedded payments from leases if available, otherwise use payments.json
    let payments = allPayments
    if (payments.length === 0 && leases.length > 0) {
      // Extract payments from leases
      payments = leases.flatMap(lease => lease.payments || [])
    }

    const pendingPayments = payments.filter(payment => payment.status === 'PENDING')
    
    // Pending payments for current month only
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    const pendingPaymentsThisMonth = pendingPayments.filter(payment => {
      const dueDate = new Date(payment.dueDate)
      return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear
    })
    
    console.log(`Total pending payments: ${pendingPayments.length}, This month: ${pendingPaymentsThisMonth.length}`)
    
    const openMaintenanceRequests = maintenance.filter(req => req.status === 'OPEN').length

    // Recent payments (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentPayments = payments
      .filter(payment => {
        if (!payment.paidDate) return false
        return new Date(payment.paidDate) >= thirtyDaysAgo
      })
      .sort((a, b) => new Date(b.paidDate!).getTime() - new Date(a.paidDate!).getTime())
      .slice(0, 5)
      .map(payment => {
        // Find tenant and property info
        const lease = leases.find(l => l.id === payment.leaseId)
        const tenant = tenants.find(t => t.id === payment.tenantId || t.id === lease?.tenantId)
        const property = properties.find(p => p.id === lease?.propertyId)
        
        return {
          id: payment.id,
          amount: payment.amount,
          type: payment.type,
          status: payment.status,
          dueDate: payment.dueDate,
          paidDate: payment.paidDate,
          tenant: {
            firstName: tenant?.firstName || 'Unknown',
            lastName: tenant?.lastName || 'Tenant'
          },
          lease: {
            property: {
              name: property?.name || 'Unknown Property'
            }
          }
        }
      })

    // Upcoming payments (next 30 days)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    
    const upcomingPayments = pendingPayments
      .filter(payment => {
        const dueDate = new Date(payment.dueDate)
        return dueDate <= thirtyDaysFromNow
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5)
      .map(payment => {
        // Find tenant and property info
        const lease = leases.find(l => l.id === payment.leaseId)
        const tenant = tenants.find(t => t.id === payment.tenantId || t.id === lease?.tenantId)
        const property = properties.find(p => p.id === lease?.propertyId)
        
        return {
          id: payment.id,
          amount: payment.amount,
          type: payment.type,
          status: payment.status,
          dueDate: payment.dueDate,
          tenant: {
            firstName: tenant?.firstName || 'Unknown',
            lastName: tenant?.lastName || 'Tenant'
          },
          lease: {
            property: {
              name: property?.name || 'Unknown Property'
            }
          }
        }
      })

    const dashboardData = {
      metrics: {
        totalProperties,
        occupiedProperties,
        totalTenants,
        pendingPayments: pendingPaymentsThisMonth.length,
        openMaintenanceRequests,
        occupancyRate,
        totalMonthlyIncome
      },
      recentPayments,
      upcomingPayments
    }

    console.log('Dashboard data:', {
      totalProperties,
      totalTenants,
      totalMonthlyIncome,
      pendingPaymentsCount: pendingPaymentsThisMonth.length,
      recentPaymentsCount: recentPayments.length,
      upcomingPaymentsCount: upcomingPayments.length
    })

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Dashboard API error:', error)
    
    // Fallback to demo data
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
      recentPayments: [],
      upcomingPayments: [
        {
          id: 'demo-1',
          amount: 750,
          type: 'RENT',
          status: 'PENDING',
          dueDate: '2025-11-01',
          tenant: {
            firstName: 'Demo',
            lastName: 'Tenant'
          },
          lease: {
            property: {
              name: 'Demo Property'
            }
          }
        }
      ]
    })
  }
}