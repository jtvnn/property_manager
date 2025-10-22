import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Simple file-based storage for development
const paymentsFilePath = path.join(process.cwd(), 'data', 'payments.json')
const tenantsFilePath = path.join(process.cwd(), 'data', 'tenants.json')
const leasesFilePath = path.join(process.cwd(), 'data', 'leases.json')
const propertiesFilePath = path.join(process.cwd(), 'data', 'properties.json')

function ensureDataDirectory() {
  const dataDir = path.dirname(paymentsFilePath)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

function readJsonFile(filePath: string) {
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

function writeJsonFile(filePath: string, data: unknown[]) {
  ensureDataDirectory()
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error)
    throw error
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payments = readJsonFile(paymentsFilePath) as any[]
    const tenants = readJsonFile(tenantsFilePath) as any[]
    const leases = readJsonFile(leasesFilePath) as any[]
    const properties = readJsonFile(propertiesFilePath) as any[]

    const payment = payments.find(p => p.id === id)
    
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Populate payment with tenant and lease information
    const tenant = tenants.find(t => t.id === payment.tenantId)
    const lease = leases.find(l => l.id === payment.leaseId)
    const property = lease ? properties.find(p => p.id === lease.propertyId) : null

    const populatedPayment = {
      ...payment,
      tenant: tenant ? {
        id: tenant.id,
        firstName: tenant.firstName,
        lastName: tenant.lastName,
        email: tenant.email,
        phone: tenant.phone
      } : null,
      lease: lease ? {
        id: lease.id,
        property: property ? {
          id: property.id,
          name: property.name,
          address: property.address,
          city: property.city,
          state: property.state,
          zipCode: property.zipCode
        } : null
      } : null
    }

    return NextResponse.json(populatedPayment)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updateData = await request.json()
    const payments = readJsonFile(paymentsFilePath) as any[]
    
    const paymentIndex = payments.findIndex(p => p.id === id)
    
    if (paymentIndex === -1) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Update the payment
    const updatedPayment = {
      ...payments[paymentIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    }

    payments[paymentIndex] = updatedPayment
    writeJsonFile(paymentsFilePath, payments)

    // Get populated payment data for response
    const tenants = readJsonFile(tenantsFilePath) as any[]
    const leases = readJsonFile(leasesFilePath) as any[]
    const properties = readJsonFile(propertiesFilePath) as any[]

    const tenant = tenants.find(t => t.id === updatedPayment.tenantId)
    const lease = leases.find(l => l.id === updatedPayment.leaseId)
    const property = lease ? properties.find(p => p.id === lease.propertyId) : null

    const populatedPayment = {
      ...updatedPayment,
      tenant: tenant ? {
        id: tenant.id,
        firstName: tenant.firstName,
        lastName: tenant.lastName,
        email: tenant.email,
        phone: tenant.phone
      } : null,
      lease: lease ? {
        id: lease.id,
        property: property ? {
          id: property.id,
          name: property.name,
          address: property.address,
          city: property.city,
          state: property.state,
          zipCode: property.zipCode
        } : null
      } : null
    }

    return NextResponse.json(populatedPayment)
  } catch (error) {
    console.error('Payment update error:', error)
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payments = readJsonFile(paymentsFilePath) as any[]
    
    const paymentIndex = payments.findIndex(p => p.id === id)
    
    if (paymentIndex === -1) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Remove the payment
    payments.splice(paymentIndex, 1)
    writeJsonFile(paymentsFilePath, payments)

    return NextResponse.json({ message: 'Payment deleted successfully' })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete payment' },
      { status: 500 }
    )
  }
}