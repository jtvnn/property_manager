'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Property {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
}

interface Tenant {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

interface LeaseFormData {
  tenantId: string
  propertyId: string
  startDate: string
  endDate: string
  monthlyRent: number
  securityDeposit: number
  status: string
}

interface LeaseFormProps {
  tenant: Tenant
  onSubmit: (data: LeaseFormData) => void
  onCancel: () => void
}

export function LeaseForm({ tenant, onSubmit, onCancel }: LeaseFormProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [formData, setFormData] = useState<LeaseFormData>({
    tenantId: tenant.id,
    propertyId: '',
    startDate: '',
    endDate: '',
    monthlyRent: 0,
    securityDeposit: 0,
    status: 'ACTIVE'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [fetchingProperties, setFetchingProperties] = useState(true)

  // Fetch properties when component mounts and when manually refreshed
  const fetchProperties = async () => {
    setFetchingProperties(true)
    try {
      const response = await fetch('/api/properties')
      if (response.ok) {
        const propertiesData = await response.json()
        setProperties(propertiesData)
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error)
    } finally {
      setFetchingProperties(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, []) // Fetch on mount

  // Reset form data when tenant changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      tenantId: tenant.id,
      propertyId: '', // Reset property selection when tenant changes
    }))
  }, [tenant.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'monthlyRent' || name === 'securityDeposit' ? parseFloat(value) || 0 : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.propertyId) newErrors.propertyId = 'Property is required'
    if (!formData.startDate) newErrors.startDate = 'Start date is required'
    if (!formData.endDate) newErrors.endDate = 'End date is required'
    if (formData.monthlyRent <= 0) newErrors.monthlyRent = 'Monthly rent must be greater than 0'
    // Security deposit is now optional
    if (formData.securityDeposit && formData.securityDeposit < 0) newErrors.securityDeposit = 'Security deposit cannot be negative'

    // Validate that end date is after start date
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      if (end <= start) {
        newErrors.endDate = 'End date must be after start date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Failed to create lease:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate suggested end date (1 year from start date)
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startDate = e.target.value
    handleInputChange(e)
    
    if (startDate && !formData.endDate) {
      const start = new Date(startDate)
      const end = new Date(start.getFullYear() + 1, start.getMonth(), start.getDate())
      setFormData(prev => ({
        ...prev,
        endDate: end.toISOString().split('T')[0]
      }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Create New Lease</CardTitle>
          <CardDescription>
            Create a new lease agreement for {tenant.firstName} {tenant.lastName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tenant Info (Read-only) */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Tenant Information</h3>
              <p className="text-sm text-gray-600">
                {tenant.firstName} {tenant.lastName} ({tenant.email})
              </p>
            </div>

            {/* Property Selection */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="propertyId" className="block text-sm font-medium text-gray-700">
                  Property *
                </label>
                <button
                  type="button"
                  onClick={fetchProperties}
                  disabled={fetchingProperties}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 flex items-center"
                  title="Refresh properties list"
                >
                  <svg
                    className={`w-4 h-4 mr-1 ${fetchingProperties ? 'animate-spin' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  {fetchingProperties ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
              <select
                id="propertyId"
                name="propertyId"
                value={formData.propertyId}
                onChange={handleInputChange}
                disabled={fetchingProperties}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.propertyId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">
                  {fetchingProperties ? 'Loading properties...' : 'Select a property'}
                </option>
                {properties.map(property => (
                  <option key={property.id} value={property.id}>
                    {property.name} - {property.address}, {property.city}
                  </option>
                ))}
              </select>
              {errors.propertyId && (
                <p className="text-red-500 text-sm mt-1">{errors.propertyId}</p>
              )}
              {properties.length === 0 && !fetchingProperties && (
                <p className="text-yellow-600 text-sm mt-1">
                  No properties found. You may need to add properties first or refresh the list.
                </p>
              )}
            </div>

            {/* Lease Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleStartDateChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
                )}
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* Financial Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="monthlyRent" className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Rent ($) *
                </label>
                <input
                  type="number"
                  id="monthlyRent"
                  name="monthlyRent"
                  value={formData.monthlyRent || ''}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.monthlyRent ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.monthlyRent && (
                  <p className="text-red-500 text-sm mt-1">{errors.monthlyRent}</p>
                )}
              </div>

              <div>
                <label htmlFor="securityDeposit" className="block text-sm font-medium text-gray-700 mb-1">
                  Security Deposit ($)
                </label>
                <input
                  type="number"
                  id="securityDeposit"
                  name="securityDeposit"
                  value={formData.securityDeposit || ''}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.securityDeposit ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.securityDeposit && (
                  <p className="text-red-500 text-sm mt-1">{errors.securityDeposit}</p>
                )}
              </div>
            </div>

            {/* Lease Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="EXPIRED">Expired</option>
                <option value="TERMINATED">Terminated</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Creating...' : 'Create Lease'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}