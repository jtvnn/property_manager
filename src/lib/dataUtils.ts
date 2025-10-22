import * as path from 'path'
import * as fs from 'fs'

// Type definitions
export interface Property {
  id: string
  name: string
  address: string
  type: string
  bedrooms: number
  bathrooms: number
  rent: number
  status: string
  createdAt: string
  updatedAt: string
}

export interface Lease {
  id: string
  propertyId: string
  tenantId: string
  startDate: string
  endDate: string
  monthlyRent: number
  securityDeposit: number
  status: string
  notes?: string
  createdAt: string
  updatedAt: string
}

const leasesFilePath = path.join(process.cwd(), 'data', 'leases.json')
const propertiesFilePath = path.join(process.cwd(), 'data', 'properties.json')

export function readLeases(): Lease[] {
  const data = fs.readFileSync(leasesFilePath, 'utf8')
  return JSON.parse(data)
}

export function writeLeases(leases: Lease[]): void {
  fs.writeFileSync(leasesFilePath, JSON.stringify(leases, null, 2))
}

export function readProperties(): Property[] {
  const data = fs.readFileSync(propertiesFilePath, 'utf8')
  return JSON.parse(data)
}

export function writeProperties(properties: Property[]): void {
  fs.writeFileSync(propertiesFilePath, JSON.stringify(properties, null, 2))
}

// Utility function to sync property statuses based on active leases
export function syncPropertyStatuses(): void {
  try {
    const leases = readLeases()
    const properties = readProperties()
    
    // Get all properties that have active leases
    const occupiedPropertyIds = new Set(
      leases
        .filter((lease: Lease) => lease.status === 'ACTIVE')
        .map((lease: Lease) => lease.propertyId)
    )
    
    // Update property statuses
    let updated = false
    properties.forEach((property: Property) => {
      const shouldBeOccupied = occupiedPropertyIds.has(property.id)
      const currentlyOccupied = property.status === 'OCCUPIED'
      
      if (shouldBeOccupied && !currentlyOccupied) {
        property.status = 'OCCUPIED'
        property.updatedAt = new Date().toISOString()
        updated = true
        console.log(`Property ${property.id} set to OCCUPIED`)
      } else if (!shouldBeOccupied && currentlyOccupied) {
        property.status = 'AVAILABLE'
        property.updatedAt = new Date().toISOString()
        updated = true
        console.log(`Property ${property.id} set to AVAILABLE`)
      }
    })
    
    if (updated) {
      writeProperties(properties)
    }
  } catch (error) {
    console.error('Failed to sync property statuses:', error)
  }
}