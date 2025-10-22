import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface MaintenanceRequest {
  id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  propertyId: string
  tenantId: string | null
  assignedTo: string | null
  estimatedCost: number | null
  actualCost: number | null
  scheduledDate: string | null
  completedDate: string | null
  notes: string
  createdAt: string
  updatedAt: string
}

interface Property {
  id: string
  name: string
  address: string
  type: string
  bedrooms: number
  bathrooms: number
  rent: number
  status: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

interface Tenant {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  emergencyContact: string
  emergencyPhone: string
  createdAt: string
  updatedAt: string
}

// Simple file-based storage for development
const maintenanceFilePath = path.join(process.cwd(), 'data', 'maintenance.json')

function ensureDataDirectory() {
  const dataDir = path.dirname(maintenanceFilePath)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

function readMaintenance(): MaintenanceRequest[] {
  ensureDataDirectory()
  if (!fs.existsSync(maintenanceFilePath)) {
    return []
  }
  try {
    const data = fs.readFileSync(maintenanceFilePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading maintenance:', error)
    return []
  }
}

function writeMaintenance(maintenance: MaintenanceRequest[]) {
  ensureDataDirectory()
  try {
    fs.writeFileSync(maintenanceFilePath, JSON.stringify(maintenance, null, 2))
  } catch (error) {
    console.error('Error writing maintenance:', error)
    throw error
  }
}

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
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

function readTenants(): Tenant[] {
  const tenantsFilePath = path.join(process.cwd(), 'data', 'tenants.json')
  if (!fs.existsSync(tenantsFilePath)) {
    return []
  }
  try {
    const data = fs.readFileSync(tenantsFilePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading tenants:', error)
    return []
  }
}

export async function GET() {
  try {
    const maintenance = readMaintenance()
    const properties = readProperties()
    const tenants = readTenants()
    
    // Populate maintenance requests with property and tenant data
    const populatedMaintenance = maintenance.map((request: MaintenanceRequest) => {
      const property = properties.find((p: Property) => p.id === request.propertyId)
      const tenant = tenants.find((t: Tenant) => t.id === request.tenantId)
      
      return {
        ...request,
        property: property || null,
        tenant: tenant || null
      }
    })
    
    return NextResponse.json(populatedMaintenance)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch maintenance requests' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.title || !body.description || !body.propertyId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, propertyId' },
        { status: 400 }
      )
    }

    const maintenance = readMaintenance()
    
    // Create new maintenance request
    const newMaintenance = {
      id: generateId(),
      title: body.title,
      description: body.description,
      category: body.category || 'GENERAL',
      priority: body.priority || 'MEDIUM',
      status: body.status || 'OPEN',
      propertyId: body.propertyId,
      tenantId: body.tenantId || null,
      assignedTo: body.assignedTo || null,
      estimatedCost: body.estimatedCost ? parseFloat(body.estimatedCost) : null,
      actualCost: body.actualCost ? parseFloat(body.actualCost) : null,
      scheduledDate: body.scheduledDate || null,
      completedDate: body.completedDate || null,
      notes: body.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    maintenance.push(newMaintenance)
    writeMaintenance(maintenance)

    return NextResponse.json(newMaintenance, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to create maintenance request' },
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
        { error: 'Maintenance request ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const maintenance = readMaintenance()
    
    const maintenanceIndex = maintenance.findIndex((m: MaintenanceRequest) => m.id === id)
    if (maintenanceIndex === -1) {
      return NextResponse.json(
        { error: 'Maintenance request not found' },
        { status: 404 }
      )
    }

    // Update maintenance request
    const updatedMaintenance = {
      ...maintenance[maintenanceIndex],
      title: body.title || maintenance[maintenanceIndex].title,
      description: body.description || maintenance[maintenanceIndex].description,
      category: body.category || maintenance[maintenanceIndex].category,
      priority: body.priority || maintenance[maintenanceIndex].priority,
      status: body.status || maintenance[maintenanceIndex].status,
      assignedTo: body.assignedTo !== undefined ? body.assignedTo : maintenance[maintenanceIndex].assignedTo,
      estimatedCost: body.estimatedCost ? parseFloat(body.estimatedCost) : maintenance[maintenanceIndex].estimatedCost,
      actualCost: body.actualCost ? parseFloat(body.actualCost) : maintenance[maintenanceIndex].actualCost,
      scheduledDate: body.scheduledDate !== undefined ? body.scheduledDate : maintenance[maintenanceIndex].scheduledDate,
      completedDate: body.completedDate !== undefined ? body.completedDate : maintenance[maintenanceIndex].completedDate,
      notes: body.notes !== undefined ? body.notes : maintenance[maintenanceIndex].notes,
      updatedAt: new Date().toISOString(),
    }

    maintenance[maintenanceIndex] = updatedMaintenance
    writeMaintenance(maintenance)

    return NextResponse.json(updatedMaintenance)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to update maintenance request' },
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
        { error: 'Maintenance request ID is required' },
        { status: 400 }
      )
    }

    const maintenance = readMaintenance()
    const maintenanceIndex = maintenance.findIndex((m: MaintenanceRequest) => m.id === id)
    
    if (maintenanceIndex === -1) {
      return NextResponse.json(
        { error: 'Maintenance request not found' },
        { status: 404 }
      )
    }

    maintenance.splice(maintenanceIndex, 1)
    writeMaintenance(maintenance)

    return NextResponse.json({ message: 'Maintenance request deleted successfully' })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete maintenance request' },
      { status: 500 }
    )
  }
}