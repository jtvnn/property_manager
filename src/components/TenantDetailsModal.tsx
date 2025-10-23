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
}

interface Lease {
  id: string
  startDate: string
  endDate: string
  monthlyRent: number
  securityDeposit: number
  status: string
  propertyId: string
  property: Property
}

interface Tenant {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  emergencyContactName: string
  emergencyContactPhone: string
  notes: string
  createdAt: string
  updatedAt: string
  leases?: Lease[]
}

interface TenantDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  tenant: Tenant | null
  onEdit?: (tenant: Tenant) => void
  onDelete?: (tenant: Tenant) => void
}

export function TenantDetailsModal({ isOpen, onClose, tenant, onEdit, onDelete }: TenantDetailsModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  if (!tenant) return null

  const getLeaseStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-100'
      case 'EXPIRED':
        return 'text-red-600 bg-red-100'
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100'
      case 'TERMINATED':
        return 'text-gray-600 bg-gray-100'
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

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const currentLease = tenant.leases?.find(lease => lease.status === 'ACTIVE') || null
  const leaseHistory = tenant.leases?.filter(lease => lease.status !== 'ACTIVE') || []

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${tenant.firstName} ${tenant.lastName}`} maxWidth="lg">
      <div className="space-y-6">
        {/* Tenant Avatar Placeholder */}
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
          <div className="text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Current Lease Status */}
        {currentLease && (
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Current Lease</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLeaseStatusColor(currentLease.status)}`}>
              {currentLease.status}
            </span>
          </div>
        )}

        {/* Tenant Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b border-gray-200 pb-2">Personal Information</h4>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900">{tenant.email}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <p className="text-gray-900">{tenant.phone}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                <p className="text-gray-900">
                  {formatDate(tenant.dateOfBirth)} ({calculateAge(tenant.dateOfBirth)} years old)
                </p>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b border-gray-200 pb-2">Emergency Contact</h4>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="text-gray-900">{tenant.emergencyContactName}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <p className="text-gray-900">{tenant.emergencyContactPhone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Lease Details */}
        {currentLease && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b border-gray-200 pb-2">Current Lease Details</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Property</label>
                <p className="text-gray-900">{currentLease.property.name}</p>
                <p className="text-sm text-gray-600">
                  {currentLease.property.address}, {currentLease.property.city}, {currentLease.property.state} {currentLease.property.zipCode}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Monthly Rent</label>
                <p className="text-2xl font-bold text-green-600">${currentLease.monthlyRent.toLocaleString()}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Lease Period</label>
                <p className="text-gray-900">
                  {formatDate(currentLease.startDate)} - {formatDate(currentLease.endDate)}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Security Deposit</label>
                <p className="text-gray-900">${currentLease.securityDeposit.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Lease History */}
        {leaseHistory.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b border-gray-200 pb-2">Lease History</h4>
            
            <div className="space-y-3">
              {leaseHistory.map((lease) => (
                <div key={lease.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{lease.property.name}</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(lease.startDate)} - {formatDate(lease.endDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${lease.monthlyRent.toLocaleString()}/mo</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLeaseStatusColor(lease.status)}`}>
                      {lease.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {tenant.notes && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 border-b border-gray-200 pb-2">Notes</h4>
            <p className="text-gray-700 leading-relaxed">{tenant.notes}</p>
          </div>
        )}

        {/* Tenant Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <label className="text-sm font-medium text-gray-600">Added</label>
            <p className="text-gray-900">{formatDate(tenant.createdAt)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Last Updated</label>
            <p className="text-gray-900">{formatDate(tenant.updatedAt)}</p>
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
                onEdit(tenant)
                onClose()
              }}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Edit Tenant
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Tenant
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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Tenant</h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete &ldquo;{tenant.firstName} {tenant.lastName}&rdquo;? This action cannot be undone.
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
                          onDelete(tenant)
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