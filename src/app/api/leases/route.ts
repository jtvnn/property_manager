import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { syncPropertyStatuses } from '@/lib/dataUtils'

/* eslint-disable @typescript-eslint/no-explicit-any */

// Simple file-based storage for development
const leasesFilePath = path.join(process.cwd(), 'data', 'leases.json')
const paymentsFilePath = path.join(process.cwd(), 'data', 'payments.json')

function ensureDataDirectory() {
  const dataDir = path.dirname(leasesFilePath)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
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

function writeLeases(leases: any[]) {
  ensureDataDirectory()
  try {
    fs.writeFileSync(leasesFilePath, JSON.stringify(leases, null, 2))
  } catch (error) {
    console.error('Error writing leases:', error)
    throw error
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

// Helper function to generate monthly payments for a lease
function generateMonthlyPayments(leaseId: string, tenantId: string, startDate: Date, endDate: Date, monthlyRent: number) {
  const payments = readPayments()
  const newPayments = []
  
  // Start from the lease start date
  const currentDate = new Date(startDate)
  const leaseEndDate = new Date(endDate)
  
  // Generate payments for each month of the lease
  while (currentDate <= leaseEndDate) {
    // Set due date to the 1st of each month
    const dueDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    
    // Skip if due date is before lease start
    if (dueDate >= startDate) {
      const payment = {
        id: generateId(),
        amount: monthlyRent,
        type: 'RENT',
        status: 'PENDING',
        dueDate: dueDate.toISOString().split('T')[0],
        paidDate: null,
        method: null,
        notes: `Monthly rent for ${dueDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        tenantId: tenantId,
        leaseId: leaseId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      newPayments.push(payment)
      payments.push(payment)
    }
    
    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1)
  }
  
  writePayments(payments)
  return newPayments
}

export async function GET() {
  try {
    const leases = readLeases()
    return NextResponse.json(leases)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leases' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.tenantId || !body.propertyId || !body.startDate || !body.endDate || !body.monthlyRent) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, propertyId, startDate, endDate, monthlyRent' },
        { status: 400 }
      )
    }

    const leases = readLeases()
    
    // Create new lease
    const newLease: any = {
      id: generateId(),
      tenantId: body.tenantId,
      propertyId: body.propertyId,
      startDate: body.startDate,
      endDate: body.endDate,
      monthlyRent: parseFloat(body.monthlyRent),
      securityDeposit: parseFloat(body.securityDeposit) || 0,
      status: body.status || 'ACTIVE',
      notes: body.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tenant: body.tenant || null,
      property: body.property || null,
      payments: [] as any[],
      paymentCount: 0,
    }

    // Generate monthly payments for the lease
    if (body.generatePayments !== false) {
      const payments = generateMonthlyPayments(
        newLease.id,
        body.tenantId,
        new Date(body.startDate),
        new Date(body.endDate),
        parseFloat(body.monthlyRent)
      )
      newLease.payments = payments
      newLease.paymentCount = payments.length
    }

    leases.push(newLease)
    writeLeases(leases)

    // Update property status to OCCUPIED when an active lease is created
    if (newLease.status === 'ACTIVE') {
      try {
        syncPropertyStatuses()
      } catch (error) {
        console.error('Failed to update property status:', error)
        // Continue execution - lease creation succeeded even if property update failed
      }
    }

    return NextResponse.json(newLease, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to create lease' },
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
        { error: 'Lease ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const leases = readLeases()
    
    const leaseIndex = leases.findIndex((l: any) => l.id === id)
    if (leaseIndex === -1) {
      return NextResponse.json(
        { error: 'Lease not found' },
        { status: 404 }
      )
    }

    // Update lease
    const updatedLease = {
      ...leases[leaseIndex],
      tenantId: body.tenantId,
      propertyId: body.propertyId,
      startDate: body.startDate,
      endDate: body.endDate,
      monthlyRent: parseFloat(body.monthlyRent),
      securityDeposit: parseFloat(body.securityDeposit),
      status: body.status,
      notes: body.notes || '',
      updatedAt: new Date().toISOString(),
    }

    leases[leaseIndex] = updatedLease
    writeLeases(leases)

    return NextResponse.json(updatedLease)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to update lease' },
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
        { error: 'Lease ID is required' },
        { status: 400 }
      )
    }

    const leases = readLeases()
    const leaseIndex = leases.findIndex((l: any) => l.id === id)
    
    if (leaseIndex === -1) {
      return NextResponse.json(
        { error: 'Lease not found' },
        { status: 404 }
      )
    }

    // Remove related payments
    const payments = readPayments()
    const filteredPayments = payments.filter((p: any) => p.leaseId !== id)
    writePayments(filteredPayments)

    // Remove lease
    leases.splice(leaseIndex, 1)
    writeLeases(leases)

    return NextResponse.json({ message: 'Lease deleted successfully' })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete lease' },
      { status: 500 }
    )
  }
}