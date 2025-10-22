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
const dataFilePath = path.join(dataPath, 'properties.json')

function ensureDataDirectory() {
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true })
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Mock property update
    const updatedProperty = {
      id: id,
      ...body,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(updatedProperty)
  } catch (error) {
    console.error('Update property error:', error)
    return NextResponse.json(
      { error: 'Failed to update property' },
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
    console.log(`Deleting property with ID: ${id}`)
    
    const properties = readProperties()
    const propertyIndex = properties.findIndex((p: any) => p.id === id)
    
    if (propertyIndex === -1) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Remove the property from the array
    properties.splice(propertyIndex, 1)
    
    // Write the updated array back to the file
    writeProperties(properties)
    
    return NextResponse.json({ message: 'Property deleted successfully' })
  } catch (error) {
    console.error('Delete property error:', error)
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    )
  }
}