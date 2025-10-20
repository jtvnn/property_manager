'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

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

interface PaymentFormProps {
  payment?: Payment
  onSubmit: (data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt' | 'tenant' | 'lease'>) => void
  onCancel: () => void
}

interface Tenant {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  status: string
  leases: Array<{
    id: string
    property: {
      name: string
    }
  }>
}

export function PaymentForm({ payment, onSubmit, onCancel }: PaymentFormProps) {
  const [formData, setFormData] = useState({
    amount: payment?.amount || 0,
    type: payment?.type || 'RENT',
    status: payment?.status || 'PENDING',
    dueDate: payment?.dueDate || '',
    paidDate: payment?.paidDate || '',
    method: payment?.method || '',
    notes: payment?.notes || '',
    tenantId: payment?.tenantId || '',
    leaseId: payment?.leaseId || ''
  })

  const [tenants, setTenants] = useState<Tenant[]>([])
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch tenants for the dropdown
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await fetch('/api/tenants')
        if (response.ok) {
          const tenantsData = await response.json()
          setTenants(tenantsData)
          
          // If editing, find the selected tenant
          if (payment?.tenantId) {
            const tenant = tenantsData.find((t: Tenant) => t.id === payment.tenantId)
            setSelectedTenant(tenant || null)
          }
        }
      } catch (error) {
        console.error('Failed to fetch tenants:', error)
      }
    }
    fetchTenants()
  }, [payment])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleTenantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tenantId = e.target.value
    const tenant = tenants.find(t => t.id === tenantId)
    setSelectedTenant(tenant || null)
    
    setFormData(prev => ({
      ...prev,
      tenantId,
      leaseId: tenant?.leases[0]?.id || '' // Auto-select first lease
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }
    
    if (!formData.type) {
      newErrors.type = 'Payment type is required'
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required'
    }
    
    if (!formData.tenantId) {
      newErrors.tenantId = 'Tenant selection is required'
    }
    
    if (!formData.leaseId) {
      newErrors.leaseId = 'Lease selection is required'
    }

    if (formData.status === 'PAID' && !formData.paidDate) {
      newErrors.paidDate = 'Paid date is required when status is PAID'
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
      {/* Tenant Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tenant *
        </label>
        <select
          name="tenantId"
          value={formData.tenantId}
          onChange={handleTenantChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          disabled={!!payment} // Disable when editing
        >
          <option value="">Select a tenant</option>
          {tenants.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.firstName} {tenant.lastName}
            </option>
          ))}
        </select>
        {errors.tenantId && <p className="text-red-500 text-xs mt-1">{errors.tenantId}</p>}
      </div>

      {/* Lease Selection */}
      {selectedTenant && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Property/Lease *
          </label>
          <select
            name="leaseId"
            value={formData.leaseId}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          >
            <option value="">Select a lease</option>
            {selectedTenant.leases?.map((lease) => (
              <option key={lease.id} value={lease.id}>
                {lease.property.name}
              </option>
            ))}
          </select>
          {errors.leaseId && <p className="text-red-500 text-xs mt-1">{errors.leaseId}</p>}
        </div>
      )}

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount *
        </label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleInputChange}
          min="0"
          step="0.01"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          placeholder="0.00"
        />
        {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
      </div>

      {/* Payment Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Payment Type *
        </label>
        <select
          name="type"
          value={formData.type}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        >
          <option value="RENT">Rent</option>
          <option value="LATE_FEE">Late Fee</option>
          <option value="DEPOSIT">Security Deposit</option>
          <option value="UTILITY">Utility Payment</option>
          <option value="MAINTENANCE">Maintenance Fee</option>
          <option value="OTHER">Other</option>
        </select>
        {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
      </div>

      {/* Payment Status */}
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
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Due Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Due Date *
        </label>
        <input
          type="date"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        />
        {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
      </div>

      {/* Paid Date (show when status is PAID) */}
      {formData.status === 'PAID' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paid Date *
          </label>
          <input
            type="date"
            name="paidDate"
            value={formData.paidDate}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
          {errors.paidDate && <p className="text-red-500 text-xs mt-1">{errors.paidDate}</p>}
        </div>
      )}

      {/* Payment Method (show when status is PAID) */}
      {formData.status === 'PAID' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Method
          </label>
          <select
            name="method"
            value={formData.method}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          >
            <option value="">Select method</option>
            <option value="CASH">Cash</option>
            <option value="CHECK">Check</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="CREDIT_CARD">Credit Card</option>
            <option value="ONLINE_PAYMENT">Online Payment</option>
            <option value="MONEY_ORDER">Money Order</option>
          </select>
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
          placeholder="Optional notes about this payment..."
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          {payment ? 'Update Payment' : 'Record Payment'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}