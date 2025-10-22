import { NextResponse } from 'next/server'

export async function GET() {
  console.log('=== SIMPLE TEST API CALLED ===')
  
  try {
    return NextResponse.json({
      status: 'success',
      message: 'Simple test API working',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV
    })
  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json({ 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}