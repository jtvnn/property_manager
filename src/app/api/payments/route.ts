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

function readPayments() {
  ensureDataDirectory()
  if (!fs.existsSync(paymentsFilePath)) {
    return []
  }
  try {
    const data = fs.readFileSync(paymentsFilePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading payments:', error)
    return []
  }
}

function readTenants() {
  ensureDataDirectory()
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

function readLeases() {
  ensureDataDirectory()
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

function readProperties() {
  ensureDataDirectory()
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

function writePayments(payments: any[]) {
  ensureDataDirectory()
  try {
    fs.writeFileSync(paymentsFilePath, JSON.stringify(payments, null, 2))
  } catch (error) {
    console.error('Error writing payments:', error)
    throw error
  }
}

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

export async function GET() {
  try {
    const payments = readPayments()
    const tenants = readTenants()
    const leases = readLeases()
    const properties = readProperties()

    // Populate payments with tenant and lease information
    const populatedPayments = payments.map((payment: any) => {
      const tenant = tenants.find((t: any) => t.id === payment.tenantId)
      const lease = leases.find((l: any) => l.id === payment.leaseId)
      const property = lease ? properties.find((p: any) => p.id === lease.propertyId) : null

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

    return NextResponse.json(populatedPayments)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.amount || !body.tenantId || !body.dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, tenantId, dueDate' },
        { status: 400 }
      )
    }

    const payments = readPayments()
    
    // Create new payment
    const newPayment = {
      id: generateId(),
      amount: parseFloat(body.amount),
      type: body.type || 'RENT',
      status: body.status || 'PENDING',
      dueDate: body.dueDate,
      paidDate: body.paidDate || null,
      method: body.method || null,
      notes: body.notes || '',
      tenantId: body.tenantId,
      leaseId: body.leaseId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    payments.push(newPayment)
    writePayments(payments)

    return NextResponse.json(newPayment, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
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
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const payments = readPayments()
    
    const paymentIndex = payments.findIndex((p: any) => p.id === id)
    if (paymentIndex === -1) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Update payment
    const updatedPayment = {
      ...payments[paymentIndex],
      amount: body.amount ? parseFloat(body.amount) : payments[paymentIndex].amount,
      type: body.type || payments[paymentIndex].type,
      status: body.status || payments[paymentIndex].status,
      dueDate: body.dueDate || payments[paymentIndex].dueDate,
      paidDate: body.paidDate || payments[paymentIndex].paidDate,
      method: body.method || payments[paymentIndex].method,
      notes: body.notes !== undefined ? body.notes : payments[paymentIndex].notes,
      updatedAt: new Date().toISOString(),
    }

    payments[paymentIndex] = updatedPayment
    writePayments(payments)

    return NextResponse.json(updatedPayment)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to update payment' },
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
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    const payments = readPayments()
    const paymentIndex = payments.findIndex((p: any) => p.id === id)
    
    if (paymentIndex === -1) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    payments.splice(paymentIndex, 1)
    writePayments(payments)

    return NextResponse.json({ message: 'Payment deleted successfully' })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete payment' },
      { status: 500 }
    )
  }
}