'use client'

import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Payment {
  id: string
  amount: number
  type: string
  status: string
  dueDate: string
  paidDate?: string
  method?: string
  notes?: string
  tenantId: string
  leaseId: string
  tenant: {
    firstName: string
    lastName: string
  }
  lease: {
    property: {
      name: string
    }
  }
  createdAt: Date
  updatedAt: Date
}

interface PaymentDetailsModalProps {
  payment: Payment
  isOpen: boolean
  onClose: () => void
  onEdit: (payment: Payment) => void
  onDelete: (paymentId: string) => void
  onMarkAsPaid: (payment: Payment) => void
}

export function PaymentDetailsModal({ 
  payment, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete,
  onMarkAsPaid 
}: PaymentDetailsModalProps) {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PAID': return 'default'
      case 'PENDING': return 'secondary'
      case 'OVERDUE': return 'destructive'
      default: return 'outline'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'RENT': return 'text-blue-600'
      case 'LATE_FEE': return 'text-red-600'
      case 'DEPOSIT': return 'text-green-600'
      case 'UTILITY': return 'text-yellow-600'
      case 'MAINTENANCE': return 'text-purple-600'
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

  const canMarkAsPaid = payment.status === 'PENDING' || payment.status === 'OVERDUE'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment Details">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {payment.tenant.firstName} {payment.tenant.lastName}
            </h3>
            <p className="text-gray-600">{payment.lease.property.name}</p>
          </div>
          <Badge variant={getStatusBadgeVariant(payment.status)}>
            {payment.status}
          </Badge>
        </div>

        {/* Payment Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Amount and Type */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Amount</label>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Payment Type</label>
              <p className={`font-medium ${getTypeColor(payment.type)}`}>
                {payment.type.replace('_', ' ')}
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Due Date</label>
              <p className="text-gray-900">{formatDate(payment.dueDate)}</p>
            </div>
            
            {payment.paidDate && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Paid Date</label>
                <p className="text-gray-900">{formatDate(payment.paidDate)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Method (if paid) */}
        {payment.method && (
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Payment Method</label>
            <p className="text-gray-900">{payment.method.replace('_', ' ')}</p>
          </div>
        )}

        {/* Notes */}
        {payment.notes && (
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Notes</label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{payment.notes}</p>
          </div>
        )}

        {/* Payment Status Indicator */}
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Payment Status</p>
              <p className="text-xs text-gray-500">
                {payment.status === 'PAID' && 'This payment has been received and processed'}
                {payment.status === 'PENDING' && 'This payment is awaiting collection'}
                {payment.status === 'OVERDUE' && 'This payment is past due and requires immediate attention'}
                {payment.status === 'CANCELLED' && 'This payment has been cancelled'}
              </p>
            </div>
            
            {canMarkAsPaid && (
              <Button 
                size="sm"
                onClick={() => onMarkAsPaid(payment)}
              >
                Mark as Paid
              </Button>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
            <div>
              <span className="font-medium">Created:</span>
              <span className="ml-1">{new Date(payment.createdAt).toLocaleString()}</span>
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>
              <span className="ml-1">{new Date(payment.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button 
            onClick={() => onEdit(payment)}
            variant="outline"
            className="flex-1"
          >
            Edit Payment
          </Button>
          
          <Button 
            onClick={() => {
              if (confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
                onDelete(payment.id)
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