'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/modal'

interface Property {
  id: string
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

interface PropertyDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  property: Property | null
  onEdit?: (property: Property) => void
  onDelete?: (property: Property) => void
}

export function PropertyDetailsModal({ isOpen, onClose, property, onEdit, onDelete }: PropertyDetailsModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  if (!property) return null

  const formatPropertyType = (type: string) => {
    return type.charAt(0) + type.slice(1).toLowerCase()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OCCUPIED':
        return 'text-green-600 bg-green-100'
      case 'AVAILABLE':
        return 'text-blue-600 bg-blue-100'
      case 'MAINTENANCE':
        return 'text-yellow-600 bg-yellow-100'
      case 'UNAVAILABLE':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={property.name} maxWidth="lg">
      <div className="space-y-6">
        {/* Property Image Placeholder */}
        <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <p className="text-sm">No image available</p>
          </div>
        </div>

        {/* Property Status */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Property Status</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(property.status)}`}>
            {property.status}
          </span>
        </div>

        {/* Property Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b border-gray-200 pb-2">Basic Information</h4>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Address</label>
                <p className="text-gray-900">{property.address}</p>
                <p className="text-gray-900">{property.city}, {property.state} {property.zipCode}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Property Type</label>
                <p className="text-gray-900">{formatPropertyType(property.type)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Monthly Rent</label>
                <p className="text-2xl font-bold text-green-600">${property.rentAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b border-gray-200 pb-2">Property Details</h4>
            
            <div className="space-y-3">
              {property.bedrooms !== null && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Bedrooms</label>
                  <p className="text-gray-900">{property.bedrooms}</p>
                </div>
              )}
              
              {property.bathrooms !== null && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Bathrooms</label>
                  <p className="text-gray-900">{property.bathrooms}</p>
                </div>
              )}
              
              {property.squareFeet !== null && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Square Feet</label>
                  <p className="text-gray-900">{property.squareFeet.toLocaleString()} sq ft</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {property.description && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 border-b border-gray-200 pb-2">Description</h4>
            <p className="text-gray-700 leading-relaxed">{property.description}</p>
          </div>
        )}

        {/* Property Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <label className="text-sm font-medium text-gray-600">Created</label>
            <p className="text-gray-900">{formatDate(property.createdAt)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Last Updated</label>
            <p className="text-gray-900">{formatDate(property.updatedAt)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Close
          </button>
          {onEdit && (
            <button
              onClick={() => {
                onEdit(property)
                onClose()
              }}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Edit Property
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Property
            </button>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDeleteConfirm(false)} />
              <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <div className="text-center">
                  <svg className="mx-auto mb-4 text-red-600 w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Property</h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete &ldquo;{property.name}&rdquo;? This action cannot be undone.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (onDelete) {
                          onDelete(property)
                        }
                        setShowDeleteConfirm(false)
                        onClose()
                      }}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}