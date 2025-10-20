'use client'

import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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

interface MaintenanceDetailsModalProps {
  request: MaintenanceRequest
  isOpen: boolean
  onClose: () => void
  onEdit: (request: MaintenanceRequest) => void
  onDelete: (requestId: string) => void
  onStatusUpdate: (requestId: string, status: string) => void
}

export function MaintenanceDetailsModal({ 
  request, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete,
  onStatusUpdate 
}: MaintenanceDetailsModalProps) {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'default'
      case 'IN_PROGRESS': return 'secondary'
      case 'SCHEDULED': return 'secondary'
      case 'OPEN': return 'outline'
      case 'CANCELLED': return 'destructive'
      default: return 'outline'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600'
      case 'MEDIUM': return 'text-yellow-600'
      case 'LOW': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'PLUMBING': return 'text-blue-600'
      case 'ELECTRICAL': return 'text-yellow-600'
      case 'HVAC': return 'text-purple-600'
      case 'APPLIANCE': return 'text-orange-600'
      case 'PEST_CONTROL': return 'text-red-600'
      case 'LANDSCAPING': return 'text-green-600'
      case 'SECURITY': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const canStartWork = request.status === 'OPEN'
  const canComplete = request.status === 'IN_PROGRESS' || request.status === 'SCHEDULED'
  const canSchedule = request.status === 'OPEN' || request.status === 'IN_PROGRESS'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Maintenance Request Details">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
            <p className="text-gray-600">{request.property.name}</p>
            <p className="text-gray-600">{request.property.address}</p>
          </div>
          <Badge variant={getStatusBadgeVariant(request.status)}>
            {request.status.replace('_', ' ')}
          </Badge>
        </div>

        {/* Request Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category and Priority */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
              <p className={`font-medium ${getCategoryColor(request.category)}`}>
                {request.category.replace('_', ' ')}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Priority Level</label>
              <p className={`font-bold ${getPriorityColor(request.priority)}`}>
                {request.priority} PRIORITY
              </p>
            </div>

            {request.assignedTo && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Assigned To</label>
                <p className="text-gray-900 font-medium">{request.assignedTo}</p>
              </div>
            )}
          </div>

          {/* Dates and Timeline */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Requested Date</label>
              <p className="text-gray-900">{formatDate(request.requestedDate)}</p>
            </div>
            
            {request.scheduledDate && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Scheduled Date</label>
                <p className="text-gray-900 font-medium">{formatDate(request.scheduledDate)}</p>
              </div>
            )}

            {request.completedDate && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Completed Date</label>
                <p className="text-gray-900 font-medium">{formatDate(request.completedDate)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
          <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{request.description}</p>
        </div>

        {/* Tenant Information */}
        <div className="bg-blue-50 p-4 rounded-md">
          <label className="block text-sm font-medium text-gray-500 mb-2">Tenant Contact</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-gray-900">
                {request.tenant.firstName} {request.tenant.lastName}
              </p>
              <p className="text-sm text-gray-600">{request.tenant.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone:</p>
              <p className="font-medium text-gray-900">{request.tenant.phone}</p>
            </div>
          </div>
        </div>

        {/* Cost Information */}
        {(request.estimatedCost || request.actualCost) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {request.estimatedCost && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Estimated Cost</label>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(request.estimatedCost)}</p>
              </div>
            )}
            
            {request.actualCost && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Actual Cost</label>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(request.actualCost)}</p>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {request.notes && (
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Notes</label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{request.notes}</p>
          </div>
        )}

        {/* Status Actions */}
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Quick Status Actions</p>
              <p className="text-xs text-gray-500">
                Update the status of this maintenance request
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {canStartWork && (
              <Button 
                size="sm"
                onClick={() => onStatusUpdate(request.id, 'IN_PROGRESS')}
              >
                Start Work
              </Button>
            )}
            
            {canSchedule && (
              <Button 
                size="sm"
                variant="outline"
                onClick={() => onStatusUpdate(request.id, 'SCHEDULED')}
              >
                Schedule
              </Button>
            )}
            
            {canComplete && (
              <Button 
                size="sm"
                onClick={() => onStatusUpdate(request.id, 'COMPLETED')}
              >
                Mark Complete
              </Button>
            )}
            
            {request.status !== 'CANCELLED' && request.status !== 'COMPLETED' && (
              <Button 
                size="sm"
                variant="destructive"
                onClick={() => onStatusUpdate(request.id, 'CANCELLED')}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
            <div>
              <span className="font-medium">Created:</span>
              <span className="ml-1">{new Date(request.createdAt).toLocaleString()}</span>
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>
              <span className="ml-1">{new Date(request.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button 
            onClick={() => onEdit(request)}
            variant="outline"
            className="flex-1"
          >
            Edit Request
          </Button>
          
          <Button 
            onClick={() => {
              if (confirm('Are you sure you want to delete this maintenance request? This action cannot be undone.')) {
                onDelete(request.id)
              }
            }}
            variant="destructive"
          >
            Delete
          </Button>
          
          <Button 
            onClick={onClose}
            variant="outline"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}