import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Type definitions
interface Tenant {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  emergencyContactName: string
  emergencyContactPhone: string
  notes: string
  createdAt: string
  updatedAt: string
  leases?: Lease[]
}

interface Lease {
  id: string
  tenantId: string
  propertyId: string
  startDate: string
  endDate: string
  monthlyRent: number
  securityDeposit: number
  status: string
  notes?: string
  createdAt: string
  updatedAt: string
  property?: {
    id: string
    name: string
    address: string
    city: string
    state: string
    zipCode: string
  }
}

interface Property {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
}

// Simple file-based storage for development
const dataFilePath = path.join(process.cwd(), 'data', 'tenants.json')

function ensureDataDirectory() {
  const dataDir = path.dirname(dataFilePath)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

function readTenants(): Tenant[] {
  ensureDataDirectory()
  if (!fs.existsSync(dataFilePath)) {
    return []
  }
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading tenants:', error)
    return []
  }
}

function writeTenants(tenants: Tenant[]): void {
  ensureDataDirectory()
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(tenants, null, 2))
  } catch (error) {
    console.error('Error writing tenants:', error)
    throw error
  }
}

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

function readLeases(): Lease[] {
  const leasesFilePath = path.join(process.cwd(), 'data', 'leases.json')
  if (!fs.existsSync(leasesFilePath)) {
    return []
  }
  try {
    const data = fs.readFileSync(leasesFilePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading leases:', error)
    return []
  }
}

function readProperties(): Property[] {
  const propertiesFilePath = path.join(process.cwd(), 'data', 'properties.json')
  if (!fs.existsSync(propertiesFilePath)) {
    return []
  }
  try {
    const data = fs.readFileSync(propertiesFilePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading properties:', error)
    return []
  }
}

export async function GET() {
  try {
    const tenants = readTenants()
    const leases = readLeases()
    const properties = readProperties()
    
    // Populate each tenant with their leases
    const tenantsWithLeases = tenants.map((tenant: Tenant) => {
      // Find all leases for this tenant
      const tenantLeases = leases.filter((lease: Lease) => lease.tenantId === tenant.id)
      
      // Populate lease data with property information
      const populatedLeases = tenantLeases.map((lease: Lease) => {
        const property = properties.find((p: Property) => p.id === lease.propertyId)
        return {
          ...lease,
          property: property ? {
            id: property.id,
            name: property.name,
            address: property.address,
            city: property.city,
            state: property.state,
            zipCode: property.zipCode
          } : null
        }
      })
      
      return {
        ...tenant,
        leases: populatedLeases
      }
    })
    
    return NextResponse.json(tenantsWithLeases)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tenants' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.firstName || !body.lastName || !body.email || !body.phone) {
      return NextResponse.json(
        { error: 'Missing required fields: firstName, lastName, email, phone' },
        { status: 400 }
      )
    }

    const tenants = readTenants()
    
    // Check for duplicate email
    const existingTenant = tenants.find((t: Tenant) => t.email === body.email)
    if (existingTenant) {
      return NextResponse.json(
        { error: 'A tenant with this email already exists' },
        { status: 400 }
      )
    }
    
    // Create new tenant
    const newTenant = {
      id: generateId(),
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      dateOfBirth: body.dateOfBirth || null,
      emergencyContactName: body.emergencyContactName || null,
      emergencyContactPhone: body.emergencyContactPhone || null,
      notes: body.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      leases: [],
      paymentCount: 0,
      maintenanceRequestCount: 0,
    }

    tenants.push(newTenant)
    writeTenants(tenants)

    return NextResponse.json(newTenant, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to create tenant' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const tenants = readTenants()
    
    const tenantIndex = tenants.findIndex((t: Tenant) => t.id === id)
    if (tenantIndex === -1) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Update tenant
    const updatedTenant = {
      ...tenants[tenantIndex],
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      dateOfBirth: body.dateOfBirth,
      emergencyContactName: body.emergencyContactName,
      emergencyContactPhone: body.emergencyContactPhone,
      notes: body.notes || '',
      updatedAt: new Date().toISOString(),
    }

    tenants[tenantIndex] = updatedTenant
    writeTenants(tenants)

    return NextResponse.json(updatedTenant)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to update tenant' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      )
    }

    const tenants = readTenants()
    const tenantIndex = tenants.findIndex((t: Tenant) => t.id === id)
    
    if (tenantIndex === -1) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    tenants.splice(tenantIndex, 1)
    writeTenants(tenants)

    return NextResponse.json({ message: 'Tenant deleted successfully' })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete tenant' },
      { status: 500 }
    )
  }
}