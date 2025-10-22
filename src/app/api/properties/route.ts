import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Simple file-based storage for development
const dataFilePath = path.join(process.cwd(), 'data', 'properties.json')

function ensureDataDirectory() {
  const dataDir = path.dirname(dataFilePath)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

function readProperties() {
  ensureDataDirectory()
  if (!fs.existsSync(dataFilePath)) {
    return []
  }
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading properties:', error)
    return []
  }
}

function writeProperties(properties: any[]) {
  ensureDataDirectory()
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(properties, null, 2))
  } catch (error) {
    console.error('Error writing properties:', error)
    throw error
  }
}

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

export async function GET() {
  try {
    const properties = readProperties()
    return NextResponse.json(properties)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.address || !body.city || !body.state || !body.zipCode || !body.rentAmount) {
      return NextResponse.json(
        { error: 'Missing required fields: name, address, city, state, zipCode, rentAmount' },
        { status: 400 }
      )
    }

    const properties = readProperties()
    
    // Create new property
    const newProperty = {
      id: generateId(),
      name: body.name,
      address: body.address,
      city: body.city,
      state: body.state,
      zipCode: body.zipCode,
      type: body.type || 'APARTMENT',
      bedrooms: parseInt(body.bedrooms) || 0,
      bathrooms: parseFloat(body.bathrooms) || 0,
      squareFeet: parseInt(body.squareFeet) || 0,
      description: body.description || null,
      rentAmount: parseFloat(body.rentAmount),
      status: body.status || 'AVAILABLE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentTenant: null,
      leaseCount: 0,
      maintenanceRequestCount: 0,
    }

    properties.push(newProperty)
    writeProperties(properties)

    return NextResponse.json(newProperty, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to create property' },
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
        { error: 'Property ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const properties = readProperties()
    
    const propertyIndex = properties.findIndex((p: any) => p.id === id)
    if (propertyIndex === -1) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Update property
    const updatedProperty = {
      ...properties[propertyIndex],
      name: body.name,
      address: body.address,
      city: body.city,
      state: body.state,
      zipCode: body.zipCode,
      type: body.type,
      bedrooms: body.bedrooms ? parseInt(body.bedrooms) : undefined,
      bathrooms: body.bathrooms ? parseFloat(body.bathrooms) : undefined,
      squareFeet: body.squareFeet ? parseInt(body.squareFeet) : undefined,
      description: body.description,
      rentAmount: body.rentAmount ? parseFloat(body.rentAmount) : undefined,
      status: body.status,
      updatedAt: new Date().toISOString(),
    }

    properties[propertyIndex] = updatedProperty
    writeProperties(properties)

    return NextResponse.json(updatedProperty)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to update property' },
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
        { error: 'Property ID is required' },
        { status: 400 }
      )
    }

    const properties = readProperties()
    const propertyIndex = properties.findIndex((p: any) => p.id === id)
    
    if (propertyIndex === -1) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    properties.splice(propertyIndex, 1)
    writeProperties(properties)

    return NextResponse.json({ message: 'Property deleted successfully' })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    )
  }
}