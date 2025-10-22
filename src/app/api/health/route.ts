import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    console.log('=== HEALTH CHECK API CALLED ===')
    console.log('Current working directory:', process.cwd())
    console.log('Environment:', process.env.NODE_ENV)
    console.log('__dirname:', __dirname)
    console.log('process.execPath:', process.execPath)
    
    // Check various possible data locations
    const locations = [
      path.join(process.cwd(), 'data'),
      path.join(__dirname, '..', '..', 'data'),
      path.join(__dirname, '..', '..', '..', 'data'),
      path.join(__dirname, 'data'),
      path.join(process.execPath, '..', 'data'),
      path.join(process.execPath, '..', 'resources', 'app.asar.unpacked', 'data')
    ]
    
    const locationStatus = locations.map(loc => ({
      path: loc,
      exists: fs.existsSync(loc),
      files: fs.existsSync(loc) ? fs.readdirSync(loc) : []
    }))
    
    return NextResponse.json({
      status: 'healthy',
      message: 'API server is running',
      environment: process.env.NODE_ENV,
      cwd: process.cwd(),
      dirname: __dirname,
      dataLocations: locationStatus,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}