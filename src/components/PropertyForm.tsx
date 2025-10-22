'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'

interface Property {
  id?: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  type: string
  bedrooms: number | null
  bathrooms: number | null
  squareFeet: number | null
  description: string | null
  imageUrl: string | null
  rentAmount: number
  status: string
  createdAt: string
  updatedAt: string
}

interface PropertyFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (property: Omit<Property, 'id' | 'imageUrl' | 'createdAt' | 'updatedAt'>) => Promise<void>
  property?: Property | null
  title: string
}

const propertyTypes = [
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'HOUSE', label: 'House' },
  { value: 'CONDO', label: 'Condo' },
  { value: 'TOWNHOUSE', label: 'Townhouse' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'DUPLEX', label: 'Duplex' },
  { value: 'OTHER', label: 'Other' }
]

const propertyStatuses = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'OCCUPIED', label: 'Occupied' },
  { value: 'MAINTENANCE', label: 'Under Maintenance' },
  { value: 'UNAVAILABLE', label: 'Unavailable' }
]

const usStates = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

export function PropertyForm({ isOpen, onClose, onSubmit, property, title }: PropertyFormProps) {
  const [formData, setFormData] = useState<Omit<Property, 'id' | 'imageUrl' | 'createdAt' | 'updatedAt'>>({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    type: 'APARTMENT',
    bedrooms: null,
    bathrooms: null,
    squareFeet: null,
    description: '',
    rentAmount: 0,
    status: 'AVAILABLE'
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when modal opens/closes or property changes
  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name,
        address: property.address,
        city: property.city,
        state: property.state,
        zipCode: property.zipCode,
        type: property.type,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        squareFeet: property.squareFeet,
        description: property.description || '',
        rentAmount: property.rentAmount,
        status: property.status
      })
    } else {
      setFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        type: 'APARTMENT',
        bedrooms: null,
        bathrooms: null,
        squareFeet: null,
        description: '',
        rentAmount: 0,
        status: 'AVAILABLE'
      })
    }
    setErrors({})
  }, [property, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Property name is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state) newErrors.state = 'State is required'
    // ZIP code is now optional
    if (formData.zipCode && !/^\d{5}(-\d{4})?$/.test(formData.zipCode)) newErrors.zipCode = 'Invalid ZIP code format'
    if (formData.rentAmount <= 0) newErrors.rentAmount = 'Rent amount must be greater than 0'
    // Property details (bedrooms, bathrooms, square feet) are now optional
    if (formData.bedrooms !== null && formData.bedrooms < 0) newErrors.bedrooms = 'Bedrooms cannot be negative'
    if (formData.bathrooms !== null && formData.bathrooms < 0) newErrors.bathrooms = 'Bathrooms cannot be negative'
    if (formData.squareFeet !== null && formData.squareFeet <= 0) newErrors.squareFeet = 'Square feet must be greater than 0'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Property Name */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Property Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., Sunset Apartments Unit 4B"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Street Address *
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
              errors.address ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="123 Main Street"
          />
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
        </div>

        {/* City, State, ZIP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              City *
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                errors.city ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="New York"
            />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              State *
            </label>
            <select
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                errors.state ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select State</option>
              {usStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              ZIP Code *
            </label>
            <input
              type="text"
              value={formData.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                errors.zipCode ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="12345"
            />
            {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
          </div>
        </div>

        {/* Property Type and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Property Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              {propertyTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              {propertyStatuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Bedrooms
            </label>
            <input
              type="number"
              min="0"
              value={formData.bedrooms || ''}
              onChange={(e) => handleInputChange('bedrooms', e.target.value ? parseInt(e.target.value) : null)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                errors.bedrooms ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="2"
            />
            {errors.bedrooms && <p className="text-red-500 text-sm mt-1">{errors.bedrooms}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Bathrooms
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={formData.bathrooms || ''}
              onChange={(e) => handleInputChange('bathrooms', e.target.value ? parseFloat(e.target.value) : null)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                errors.bathrooms ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="1.5"
            />
            {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Square Feet
            </label>
            <input
              type="number"
              min="1"
              value={formData.squareFeet || ''}
              onChange={(e) => handleInputChange('squareFeet', e.target.value ? parseInt(e.target.value) : null)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                errors.squareFeet ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="1200"
            />
            {errors.squareFeet && <p className="text-red-500 text-sm mt-1">{errors.squareFeet}</p>}
          </div>
        </div>

        {/* Rent Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Monthly Rent *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-700">$</span>
            <input
              type="number"
              min="0"
              value={formData.rentAmount || ''}
              onChange={(e) => handleInputChange('rentAmount', parseFloat(e.target.value) || 0)}
              className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                errors.rentAmount ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="1500"
            />
          </div>
          {errors.rentAmount && <p className="text-red-500 text-sm mt-1">{errors.rentAmount}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Description
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Optional description of the property..."
          />
        </div>

        {/* Form Actions */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : property ? 'Update Property' : 'Add Property'}
          </button>
        </div>
      </form>
    </Modal>
  )
}