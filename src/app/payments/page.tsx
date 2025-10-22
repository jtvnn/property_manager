'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { PaymentForm } from '@/components/payment-form'
import { PaymentDetailsModal } from '@/components/payment-details-modal'
import { getCurrentMonth, getCurrentYear, formatCurrentMonthYear } from '@/lib/dateUtils'

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

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch payments
  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/payments')
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched payments:', data)
        console.log('Pending payments:', data.filter((p: Payment) => p.status === 'PENDING'))
        setPayments(data)
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPayment = async (paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt' | 'tenant' | 'lease'>) => {
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      })

      if (response.ok) {
        const newPayment = await response.json()
        setPayments(prev => [...prev, newPayment])
        setIsAddModalOpen(false)
      }
    } catch (error) {
      console.error('Failed to add payment:', error)
    }
  }

  const handleEditPayment = async (paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt' | 'tenant' | 'lease'>) => {
    if (!editingPayment) return

    try {
      const response = await fetch(`/api/payments/${editingPayment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      })

      if (response.ok) {
        const updatedPayment = await response.json()
        setPayments(prev => 
          prev.map(p => p.id === editingPayment.id ? updatedPayment : p)
        )
        setEditingPayment(null)
        setIsEditModalOpen(false)
      }
    } catch (error) {
      console.error('Failed to update payment:', error)
    }
  }

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment?')) return

    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPayments(prev => prev.filter(p => p.id !== paymentId))
        setIsDetailsModalOpen(false)
      }
    } catch (error) {
      console.error('Failed to delete payment:', error)
    }
  }

  const handleMarkAsPaid = async (payment: Payment) => {
    const updatedData = {
      status: 'PAID',
      paidDate: new Date().toISOString().split('T')[0],
      method: 'BANK_TRANSFER' // Default method, can be changed
    }

    try {
      const response = await fetch(`/api/payments/${payment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      })

      if (response.ok) {
        const updatedPayment = await response.json()
        setPayments(prev => 
          prev.map(p => p.id === payment.id ? updatedPayment : p)
        )
      }
    } catch (error) {
      console.error('Failed to mark payment as paid:', error)
    }
  }

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
      default: return 'text-gray-600'
    }
  }

  // Calculate summary stats (current month only)
  const currentMonth = getCurrentMonth()
  const currentYear = getCurrentYear()
  
  const isCurrentMonth = (payment: Payment) => {
    const dueDate = new Date(payment.dueDate)
    return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear
  }
  
  const totalReceived = payments
    .filter(p => p.status === 'PAID' && isCurrentMonth(p))
    .reduce((sum, p) => sum + p.amount, 0)
  
  const totalPending = payments
    .filter(p => p.status === 'PENDING' && isCurrentMonth(p))
    .reduce((sum, p) => sum + p.amount, 0)
  
  const totalOverdue = payments
    .filter(p => p.status === 'OVERDUE' && isCurrentMonth(p))
    .reduce((sum, p) => sum + p.amount, 0)

  // Group payments by status (filter for current month only)
  const paidPayments = payments.filter(p => p.status === 'PAID' && isCurrentMonth(p))
  const pendingPayments = payments.filter(p => p.status === 'PENDING' && isCurrentMonth(p))
  const overduePayments = payments.filter(p => p.status === 'OVERDUE' && isCurrentMonth(p))

  if (loading) {
    return <div className="p-8">Loading payments...</div>
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600 mt-2">
            Track rent payments, fees, and financial transactions for {formatCurrentMonthYear()}
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          Record Payment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Received</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalReceived.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">{paidPayments.length} payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">${totalPending.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">{pendingPayments.length} payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalOverdue.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">{overduePayments.length} payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{payments.length}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Payments Section */}
      {overduePayments.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-red-600 mb-4">Overdue Payments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overduePayments.map((payment) => (
              <Card key={payment.id} className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {payment.tenant.firstName} {payment.tenant.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{payment.lease.property.name}</p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(payment.status)}>
                      {payment.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Amount:</span>
                      <span className="font-medium">${payment.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Type:</span>
                      <span className={`text-sm font-medium ${getTypeColor(payment.type)}`}>
                        {payment.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Due Date:</span>
                      <span className="text-sm">{new Date(payment.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button 
                      size="sm" 
                      onClick={() => handleMarkAsPaid(payment)}
                      className="flex-1"
                    >
                      Mark Paid
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setSelectedPayment(payment)
                        setIsDetailsModalOpen(true)
                      }}
                    >
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Pending Payments Section */}
      {pendingPayments.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-yellow-600 mb-4">Pending Payments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingPayments.map((payment) => (
              <Card key={payment.id} className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {payment.tenant.firstName} {payment.tenant.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{payment.lease.property.name}</p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(payment.status)}>
                      {payment.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Amount:</span>
                      <span className="font-medium">${payment.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Type:</span>
                      <span className={`text-sm font-medium ${getTypeColor(payment.type)}`}>
                        {payment.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Due Date:</span>
                      <span className="text-sm">{new Date(payment.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button 
                      size="sm" 
                      onClick={() => handleMarkAsPaid(payment)}
                      className="flex-1"
                    >
                      Mark Paid
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setSelectedPayment(payment)
                        setIsDetailsModalOpen(true)
                      }}
                    >
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Paid Payments Section */}
      <div>
        <h2 className="text-xl font-semibold text-green-600 mb-4">Recent Paid Payments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paidPayments.slice(0, 6).map((payment) => (
            <Card key={payment.id} className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {payment.tenant.firstName} {payment.tenant.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{payment.lease.property.name}</p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(payment.status)}>
                    {payment.status}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Amount:</span>
                    <span className="font-medium">${payment.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Type:</span>
                    <span className={`text-sm font-medium ${getTypeColor(payment.type)}`}>
                      {payment.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Paid Date:</span>
                    <span className="text-sm">{payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  {payment.method && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Method:</span>
                      <span className="text-sm">{payment.method.replace('_', ' ')}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setSelectedPayment(payment)
                      setIsDetailsModalOpen(true)
                    }}
                    className="flex-1"
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Modals */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Record New Payment"
      >
        <PaymentForm 
          onSubmit={handleAddPayment}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingPayment(null)
        }}
        title="Edit Payment"
      >
        {editingPayment && (
          <PaymentForm 
            payment={editingPayment}
            onSubmit={handleEditPayment}
            onCancel={() => {
              setIsEditModalOpen(false)
              setEditingPayment(null)
            }}
          />
        )}
      </Modal>

      {selectedPayment && (
        <PaymentDetailsModal
          payment={selectedPayment}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false)
            setSelectedPayment(null)
          }}
          onEdit={(payment: Payment) => {
            setEditingPayment(payment)
            setIsDetailsModalOpen(false)
            setIsEditModalOpen(true)
          }}
          onDelete={handleDeletePayment}
          onMarkAsPaid={handleMarkAsPaid}
        />
      )}
    </div>
  )
}