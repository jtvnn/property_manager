import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Type definitions
interface Property {
  id: string
  name: string
  address: string
  type: string
  bedrooms: number
  bathrooms: number
  rent: number
  status: string
  createdAt: string
  updatedAt: string
}

interface Tenant {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  createdAt: string
  updatedAt: string
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
  notes?: string
  createdAt: string
  updatedAt: string
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
  description?: string
  createdAt: string
  updatedAt: string
}

interface MaintenanceRequest {
  id: string
  propertyId: string
  title: string
  description: string
  priority: string
  status: string
  cost?: number
  createdAt: string
  updatedAt: string
}

interface Activity {
  id: string
  type: string
  title: string
  description: string
  date: string
}

// Simple file-based storage for development
function getDataPath() {
  // In production (standalone), the data should be in the app root
  // In development, use the current working directory
  const isDev = process.env.NODE_ENV === 'development'
  
  if (isDev) {
    return path.join(process.cwd(), 'data')
  } else {
    // In production standalone build, the working directory is set to the standalone directory
    // So we can just use process.cwd() + 'data'
    const cwdDataPath = path.join(process.cwd(), 'data')
    
    console.log('=== DASHBOARD API getDataPath ===')
    console.log('Production mode data path resolution:')
    console.log('process.cwd():', process.cwd())
    console.log('__dirname:', __dirname)
    console.log('Trying CWD data path:', cwdDataPath)
    console.log('CWD data path exists:', fs.existsSync(cwdDataPath))
    
    if (fs.existsSync(cwdDataPath)) {
      console.log('Using CWD data path:', cwdDataPath)
      return cwdDataPath
    }
    
    // Fallback: try multiple possible locations
    const possiblePaths = [
      path.join(__dirname, '..', '..', 'data'),
      path.join(__dirname, '..', '..', '..', 'data'),
      path.join(__dirname, 'data'),
      path.join(process.execPath, '..', 'data'),
      path.join(process.execPath, '..', 'resources', 'app.asar.unpacked', 'data')
    ]
    
    console.log('Trying fallback paths:')
    for (const testPath of possiblePaths) {
      console.log(`  ${testPath}: ${fs.existsSync(testPath) ? 'EXISTS' : 'NOT FOUND'}`)
      if (fs.existsSync(testPath)) {
        console.log('Using fallback path:', testPath)
        return testPath
      }
    }
    
    console.log('No data directory found, using CWD as fallback:', cwdDataPath)
    return cwdDataPath
  }
}

const dataPath = getDataPath()
const propertiesFilePath = path.join(dataPath, 'properties.json')
const tenantsFilePath = path.join(dataPath, 'tenants.json')
const leasesFilePath = path.join(dataPath, 'leases.json')
const paymentsFilePath = path.join(dataPath, 'payments.json')
const maintenanceFilePath = path.join(dataPath, 'maintenance.json')

function ensureDataDirectory() {
  const dataDir = path.dirname(propertiesFilePath)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

function readJsonFile(filePath: string): unknown[] {
  ensureDataDirectory()
  if (!fs.existsSync(filePath)) {
    return []
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error)
    return []
  }
}

export async function GET() {
  console.log('=== DASHBOARD API CALLED ===')
  console.log('Data path:', dataPath)
  console.log('Environment:', process.env.NODE_ENV)
  console.log('Current working directory:', process.cwd())
  console.log('__dirname:', __dirname)
  
  try {
    console.log('Reading data files...')
    
    console.log('Properties file:', propertiesFilePath)
    console.log('Properties exists:', fs.existsSync(propertiesFilePath))
    const properties = readJsonFile(propertiesFilePath) as Property[]
    console.log('Properties loaded:', properties.length)
    
    console.log('Tenants file:', tenantsFilePath)
    console.log('Tenants exists:', fs.existsSync(tenantsFilePath))
    const tenants = readJsonFile(tenantsFilePath) as Tenant[]
    console.log('Tenants loaded:', tenants.length)
    
    console.log('Leases file:', leasesFilePath)
    console.log('Leases exists:', fs.existsSync(leasesFilePath))
    const leases = readJsonFile(leasesFilePath) as Lease[]
    console.log('Leases loaded:', leases.length)
    
    console.log('Payments file:', paymentsFilePath)
    console.log('Payments exists:', fs.existsSync(paymentsFilePath))
    const payments = readJsonFile(paymentsFilePath) as Payment[]
    console.log('Payments loaded:', payments.length)
    
    console.log('Maintenance file:', maintenanceFilePath)
    console.log('Maintenance exists:', fs.existsSync(maintenanceFilePath))
    const maintenance = readJsonFile(maintenanceFilePath) as MaintenanceRequest[]
    console.log('Maintenance loaded:', maintenance.length)

    console.log('Processing data...')
    
    // Populate payments with tenant and lease information
    const populatedPayments = payments.map((payment) => {
      const tenant = tenants.find((t) => t.id === payment.tenantId)
      const lease = leases.find((l) => l.id === payment.leaseId)
      const property = lease ? properties.find((p) => p.id === lease.propertyId) : null

      return {
        ...payment,
        tenant: tenant ? {
          id: tenant.id,
          firstName: tenant.firstName,
          lastName: tenant.lastName,
          email: tenant.email
        } : null,
        lease: lease ? {
          id: lease.id,
          property: property ? {
            id: property.id,
            name: property.name,
            address: property.address
          } : null
        } : null
      }
    })

    // Calculate statistics
    const totalProperties = properties.length
    const totalTenants = tenants.length
    const activeLeases = leases.filter((lease) => lease.status === 'ACTIVE').length
    
    // Count unique properties that have active leases
    const activeLeasePropertyIds = new Set(
      leases
        .filter((lease) => lease.status === 'ACTIVE')
        .map((lease) => lease.propertyId)
    )
    
    // Only count properties that actually exist in our properties list
    const occupiedProperties = Array.from(activeLeasePropertyIds)
      .filter(propertyId => properties.some(property => property.id === propertyId))
      .length

    // Payment statistics
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    // Payments due in current month
    const monthlyPayments = populatedPayments.filter((payment) => {
      const paymentDate = new Date(payment.dueDate)
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear
    })
    
    // Total rent collected across all time
    const totalRentCollected = populatedPayments
      .filter((payment) => payment.status === 'PAID' && payment.type === 'RENT')
      .reduce((sum: number, payment) => sum + payment.amount, 0)
    
    // Expected monthly income from active leases
    const expectedMonthlyIncome = leases
      .filter((lease) => lease.status === 'ACTIVE')
      .reduce((sum: number, lease) => sum + (lease.monthlyRent || 0), 0)
    
    const pendingPayments = populatedPayments.filter((payment) => payment.status === 'PENDING')
    const totalPendingAmount = pendingPayments.reduce((sum: number, payment) => sum + payment.amount, 0)

    // Maintenance statistics
    const openMaintenanceRequests = maintenance.filter((req) => req.status === 'OPEN').length
    const inProgressMaintenanceRequests = maintenance.filter((req) => req.status === 'IN_PROGRESS').length

    // Recent activities (last 10 items)
    const recentActivities: Activity[] = []
    
    // Add recent leases
    const recentLeases = leases
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
      .map((lease): Activity => ({
        id: lease.id,
        type: 'lease',
        title: `New lease created`,
        description: `Lease for property ${lease.propertyId}`,
        date: lease.createdAt,
      }))

    // Add recent payments
    const recentPayments = populatedPayments
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3)
      .map((payment): Activity => ({
        id: payment.id,
        type: 'payment',
        title: `Payment ${payment.status.toLowerCase()}`,
        description: `$${payment.amount} - ${payment.type}`,
        date: payment.updatedAt,
      }))

    // Add recent maintenance
    const recentMaintenance = maintenance
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
      .map((req): Activity => ({
        id: req.id,
        type: 'maintenance',
        title: `Maintenance request: ${req.title}`,
        description: `Priority: ${req.priority}`,
        date: req.createdAt,
      }))

    recentActivities.push(...recentLeases, ...recentPayments, ...recentMaintenance)
    recentActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const dashboardData = {
      metrics: {
        totalProperties,
        totalTenants,
        activeLeases,
        occupiedProperties,
        occupancyRate: totalProperties > 0 ? Math.round((occupiedProperties / totalProperties) * 100) : 0,
        totalRentCollected,
        pendingPaymentsCount: pendingPayments.length,
        totalPendingAmount,
        openMaintenanceRequests,
        inProgressMaintenanceRequests,
        monthlyPaymentsCount: monthlyPayments.length,
        totalMonthlyIncome: expectedMonthlyIncome,
        pendingPayments: pendingPayments.length,
      },
      recentActivities: recentActivities.slice(0, 10),
      recentPayments: populatedPayments
        .filter((payment) => {
          const today = new Date()
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(today.getDate() - 30)
          
          // Only include payments that were paid, or had meaningful recent activity
          const updatedDate = new Date(payment.updatedAt)
          const createdDate = new Date(payment.createdAt)
          const paidDate = payment.paidDate ? new Date(payment.paidDate) : null
          
          // Show if: recently paid, or recently updated (but not just created)
          return (paidDate && paidDate >= thirtyDaysAgo) || 
                 (updatedDate >= thirtyDaysAgo && updatedDate.getTime() !== createdDate.getTime())
        })
        .sort((a, b) => {
          // Sort by paid date first (if available), then by updated date
          const aPaidDate = a.paidDate ? new Date(a.paidDate).getTime() : 0
          const bPaidDate = b.paidDate ? new Date(b.paidDate).getTime() : 0
          const aUpdatedDate = new Date(a.updatedAt).getTime()
          const bUpdatedDate = new Date(b.updatedAt).getTime()
          
          return Math.max(bPaidDate, bUpdatedDate) - Math.max(aPaidDate, aUpdatedDate)
        })
        .slice(0, 5),
      upcomingPayments: pendingPayments
        .filter((payment) => {
          const dueDate = new Date(payment.dueDate)
          const today = new Date()
          const thirtyDaysFromNow = new Date()
          thirtyDaysFromNow.setDate(today.getDate() + 30)
          return dueDate >= today && dueDate <= thirtyDaysFromNow
        })
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5),
      urgentMaintenance: maintenance
        .filter((req) => req.priority === 'HIGH' && req.status === 'OPEN')
        .slice(0, 5),
    }

    console.log('Dashboard data prepared successfully')
    console.log('Returning response...')
    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('=== DASHBOARD API ERROR ===')
    console.error('Error details:', error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('Data path used:', dataPath)
    console.error('Properties file exists:', fs.existsSync(propertiesFilePath))
    console.error('Process cwd:', process.cwd())
    console.error('__dirname:', __dirname)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error',
        dataPath: dataPath,
        propertiesExists: fs.existsSync(propertiesFilePath)
      },
      { status: 500 }
    )
  }
}