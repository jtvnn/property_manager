import { NextRequest, NextResponse } from 'next/server'
import { readLeases, writeLeases, syncPropertyStatuses, Lease } from '@/lib/dataUtils'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const leases = readLeases()
    const leaseIndex = leases.findIndex((lease: Lease) => lease.id === id)
    
    if (leaseIndex === -1) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 })
    }
    
    const originalStatus = leases[leaseIndex].status
    
    // Update lease
    leases[leaseIndex] = {
      ...leases[leaseIndex],
      ...body,
      updatedAt: new Date().toISOString()
    }
    
    writeLeases(leases)
    
    // If status changed, sync property statuses
    if (originalStatus !== body.status) {
      syncPropertyStatuses()
    }
    
    return NextResponse.json(leases[leaseIndex])
  } catch (error) {
    console.error('Error updating lease:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    const leases = readLeases()
    const leaseIndex = leases.findIndex((lease: Lease) => lease.id === id)
    
    if (leaseIndex === -1) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 })
    }
    
    // Remove lease
    leases.splice(leaseIndex, 1)
    writeLeases(leases)
    
    // Sync property statuses after lease deletion
    syncPropertyStatuses()
    
    return NextResponse.json({ message: 'Lease deleted successfully' })
  } catch (error) {
    console.error('Error deleting lease:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}