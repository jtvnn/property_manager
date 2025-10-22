import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Get data file paths
const getDataPath = () => {
  const isDev = process.env.NODE_ENV === 'development'
  
  if (isDev) {
    return path.join(process.cwd(), 'data')
  } else {
    const cwdDataPath = path.join(process.cwd(), 'data')
    
    if (fs.existsSync(cwdDataPath)) {
      return cwdDataPath
    } else {
      return cwdDataPath
    }
  }
}

const dataPath = getDataPath()
const dataFilePath = path.join(dataPath, 'tenants.json')

function ensureDataDirectory() {
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true })
  }
}

function readTenants() {
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

function writeTenants(tenants: any[]) {
  ensureDataDirectory()
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(tenants, null, 2))
  } catch (error) {
    console.error('Error writing tenants:', error)
    throw error
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Mock tenant update
    const updatedTenant = {
      id: id,
      ...body,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(updatedTenant)
  } catch (error) {
    console.error('Update tenant error:', error)
    return NextResponse.json(
      { error: 'Failed to update tenant' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log(`Deleting tenant with ID: ${id}`)
    
    const tenants = readTenants()
    const tenantIndex = tenants.findIndex((t: any) => t.id === id)
    
    if (tenantIndex === -1) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Remove the tenant from the array
    tenants.splice(tenantIndex, 1)
    
    // Write the updated array back to the file
    writeTenants(tenants)
    
    return NextResponse.json({ message: 'Tenant deleted successfully' })
  } catch (error) {
    console.error('Delete tenant error:', error)
    return NextResponse.json(
      { error: 'Failed to delete tenant' },
      { status: 500 }
    )
  }
}