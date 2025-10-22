'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface MaintenanceRequest {
  id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  tenantId: string
  propertyId: string
  assignedTo?: string
  estimatedCost?: number
  actualCost?: number
  requestedDate: string
  scheduledDate?: string
  completedDate?: string
  notes?: string
  tenant: {
    firstName: string
    lastName: string
    phone: string
    email: string
  }
  property: {
    name: string
    address: string
  }
  createdAt: Date
  updatedAt: Date
}

interface MaintenanceFormProps {
  request?: MaintenanceRequest
  onSubmit: (data: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt' | 'tenant' | 'property'>) => void
  onCancel: () => void
}

interface Property {
  id: string
  name: string
  address: string
}

interface Tenant {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

interface Lease {
  id: string
  propertyId: string
  tenantId: string
  status: string
}

export function MaintenanceForm({ request, onSubmit, onCancel }: MaintenanceFormProps) {
  const [formData, setFormData] = useState({
    title: request?.title || '',
    description: request?.description || '',
    category: request?.category || 'GENERAL',
    priority: request?.priority || 'MEDIUM',
    status: request?.status || 'OPEN',
    tenantId: request?.tenantId || '',
    propertyId: request?.propertyId || '',
    assignedTo: request?.assignedTo || '',
    estimatedCost: request?.estimatedCost || 0,
    actualCost: request?.actualCost || 0,
    requestedDate: request?.requestedDate || new Date().toISOString().split('T')[0],
    scheduledDate: request?.scheduledDate || '',
    completedDate: request?.completedDate || '',
    notes: request?.notes || ''
  })

  const [properties, setProperties] = useState<Property[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [leases, setLeases] = useState<Lease[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch properties, tenants, and leases
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propertiesRes, tenantsRes, leasesRes] = await Promise.all([
          fetch('/api/properties'),
          fetch('/api/tenants'),
          fetch('/api/leases')
        ])

        if (propertiesRes.ok) {
          const propertiesData = await propertiesRes.json()
          setProperties(propertiesData)
          
          // If editing, find the selected property
          if (request?.propertyId) {
            const property = propertiesData.find((p: Property) => p.id === request.propertyId)
            setSelectedProperty(property || null)
          }
        }

        if (tenantsRes.ok) {
          const tenantsData = await tenantsRes.json()
          setTenants(tenantsData)
        }

        if (leasesRes.ok) {
          const leasesData = await leasesRes.json()
          setLeases(leasesData)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }
    fetchData()
  }, [request])

  // Update available tenants when property or leases change
  useEffect(() => {
    if (selectedProperty && leases.length > 0 && tenants.length > 0) {
      // Find active leases for the selected property
      const propertyLeases = leases.filter(
        lease => lease.propertyId === selectedProperty.id && lease.status === 'ACTIVE'
      )
      
      // Get tenants who have active leases for this property
      const propertyTenants = tenants.filter(tenant => 
        propertyLeases.some(lease => lease.tenantId === tenant.id)
      )
      
      setAvailableTenants(propertyTenants)
    } else {
      setAvailableTenants([])
    }
  }, [selectedProperty, leases, tenants])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'estimatedCost' || name === 'actualCost' ? parseFloat(value) || 0 : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handlePropertyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const propertyId = e.target.value
    const property = properties.find(p => p.id === propertyId)
    setSelectedProperty(property || null)
    
    setFormData(prev => ({
      ...prev,
      propertyId,
      tenantId: '' // Reset tenant when property changes
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required'
    }
    
    if (!formData.priority) {
      newErrors.priority = 'Priority is required'
    }
    
    if (!formData.propertyId) {
      newErrors.propertyId = 'Property selection is required'
    }
    
    if (!formData.tenantId) {
      newErrors.tenantId = 'Tenant selection is required'
    }

    if (formData.status === 'SCHEDULED' && !formData.scheduledDate) {
      newErrors.scheduledDate = 'Scheduled date is required when status is SCHEDULED'
    }

    if (formData.status === 'COMPLETED' && !formData.completedDate) {
      newErrors.completedDate = 'Completed date is required when status is COMPLETED'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Request Title *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          placeholder="Brief description of the issue"
        />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Detailed Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          placeholder="Detailed description of the maintenance issue..."
        />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
      </div>

      {/* Category and Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          >
            <option value="GENERAL">General Maintenance</option>
            <option value="PLUMBING">Plumbing</option>
            <option value="ELECTRICAL">Electrical</option>
            <option value="HVAC">HVAC</option>
            <option value="APPLIANCE">Appliance</option>
            <option value="PEST_CONTROL">Pest Control</option>
            <option value="LANDSCAPING">Landscaping</option>
            <option value="SECURITY">Security</option>
          </select>
          {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority *
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          >
            <option value="LOW">Low - Can wait</option>
            <option value="MEDIUM">Medium - Normal timeframe</option>
            <option value="HIGH">High - Urgent attention needed</option>
          </select>
          {errors.priority && <p className="text-red-500 text-xs mt-1">{errors.priority}</p>}
        </div>
      </div>

      {/* Property Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Property *
        </label>
        <select
          name="propertyId"
          value={formData.propertyId}
          onChange={handlePropertyChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          disabled={!!request} // Disable when editing
        >
          <option value="">Select a property</option>
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.name}
            </option>
          ))}
        </select>
        {errors.propertyId && <p className="text-red-500 text-xs mt-1">{errors.propertyId}</p>}
      </div>

      {/* Tenant Selection */}
      {selectedProperty && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tenant *
          </label>
          <select
            name="tenantId"
            value={formData.tenantId}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          >
            <option value="">Select a tenant</option>
            {availableTenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.firstName} {tenant.lastName} - {tenant.phone}
              </option>
            ))}
          </select>
          {errors.tenantId && <p className="text-red-500 text-xs mt-1">{errors.tenantId}</p>}
          {availableTenants.length === 0 && selectedProperty && (
            <p className="text-gray-500 text-xs mt-1">No active tenants found for this property</p>
          )}
        </div>
      )}

      {/* Status (show when editing) */}
      {request && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          >
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      )}

      {/* Assigned To */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Assigned To
        </label>
        <input
          type="text"
          name="assignedTo"
          value={formData.assignedTo}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          placeholder="Contractor or company name"
        />
      </div>

      {/* Cost Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estimated Cost
          </label>
          <input
            type="number"
            name="estimatedCost"
            value={formData.estimatedCost}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            placeholder="0.00"
          />
        </div>

        {(formData.status === 'COMPLETED') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Actual Cost
            </label>
            <input
              type="number"
              name="actualCost"
              value={formData.actualCost}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="0.00"
            />
          </div>
        )}
      </div>

      {/* Scheduled Date (show when status is SCHEDULED) */}
      {formData.status === 'SCHEDULED' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Scheduled Date *
          </label>
          <input
            type="date"
            name="scheduledDate"
            value={formData.scheduledDate}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
          {errors.scheduledDate && <p className="text-red-500 text-xs mt-1">{errors.scheduledDate}</p>}
        </div>
      )}

      {/* Completed Date (show when status is COMPLETED) */}
      {formData.status === 'COMPLETED' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Completed Date *
          </label>
          <input
            type="date"
            name="completedDate"
            value={formData.completedDate}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
          {errors.completedDate && <p className="text-red-500 text-xs mt-1">{errors.completedDate}</p>}
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          placeholder="Additional notes, special instructions, or updates..."
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          {request ? 'Update Request' : 'Create Request'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}