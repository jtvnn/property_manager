import { NextResponse } from 'next/server'
import { syncPropertyStatuses } from '@/lib/dataUtils'

export async function POST() {
  try {
    syncPropertyStatuses()
    return NextResponse.json({ success: true, message: 'Property statuses synced successfully' })
  } catch (error) {
    console.error('Error syncing property statuses:', error)
    return NextResponse.json({ error: 'Failed to sync property statuses' }, { status: 500 })
  }
}