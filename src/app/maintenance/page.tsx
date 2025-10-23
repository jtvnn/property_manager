'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { MaintenanceForm } from '@/components/maintenance-form'
import { MaintenanceDetailsModal } from '@/components/maintenance-details-modal'

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

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [editingRequest, setEditingRequest] = useState<MaintenanceRequest | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch maintenance requests
  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/maintenance')
      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      }
    } catch (error) {
      console.error('Failed to fetch maintenance requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddRequest = async (requestData: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt' | 'tenant' | 'property'>) => {
    try {
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (response.ok) {
        const newRequest = await response.json()
        setRequests(prev => [...prev, newRequest])
        setIsAddModalOpen(false)
      }
    } catch (error) {
      console.error('Failed to add maintenance request:', error)
    }
  }

  const handleEditRequest = async (requestData: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt' | 'tenant' | 'property'>) => {
    if (!editingRequest) return

    try {
      const response = await fetch(`/api/maintenance/${editingRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (response.ok) {
        const updatedRequest = await response.json()
        setRequests(prev => 
          prev.map(r => r.id === editingRequest.id ? updatedRequest : r)
        )
        setEditingRequest(null)
        setIsEditModalOpen(false)
      }
    } catch (error) {
      console.error('Failed to update maintenance request:', error)
    }
  }

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this maintenance request?')) return

    try {
      const response = await fetch(`/api/maintenance/${requestId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setRequests(prev => prev.filter(r => r.id !== requestId))
        setIsDetailsModalOpen(false)
      }
    } catch (error) {
      console.error('Failed to delete maintenance request:', error)
    }
  }

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/maintenance/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const updatedRequest = await response.json()
        setRequests(prev => 
          prev.map(r => r.id === requestId ? updatedRequest : r)
        )
      }
    } catch (error) {
      console.error('Failed to update request status:', error)
    }
  }

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
      case 'GENERAL': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  // Calculate summary stats
  const openRequests = requests.filter(r => r.status === 'OPEN')
  const inProgressRequests = requests.filter(r => r.status === 'IN_PROGRESS')
  const scheduledRequests = requests.filter(r => r.status === 'SCHEDULED')
  const completedRequests = requests.filter(r => r.status === 'COMPLETED')
  const highPriorityRequests = requests.filter(r => r.priority === 'HIGH' && r.status !== 'COMPLETED')

  const totalEstimatedCost = requests
    .filter(r => r.status !== 'CANCELLED' && r.estimatedCost)
    .reduce((sum, r) => sum + (r.estimatedCost || 0), 0)

  if (loading) {
    return <div className="p-8">Loading maintenance requests...</div>
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Portal</h1>
          <p className="text-gray-600 mt-2">Track and manage property maintenance requests and work orders</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          Create Request
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Open Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{openRequests.length}</div>
            <p className="text-xs text-gray-500 mt-1">Awaiting action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{inProgressRequests.length}</div>
            <p className="text-xs text-gray-500 mt-1">Being worked on</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{scheduledRequests.length}</div>
            <p className="text-xs text-gray-500 mt-1">Future appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedRequests.length}</div>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{highPriorityRequests.length}</div>
            <p className="text-xs text-gray-500 mt-1">Urgent items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Est. Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${totalEstimatedCost.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Active requests</p>
          </CardContent>
        </Card>
      </div>

      {/* High Priority Requests Section */}
      {highPriorityRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-red-600 mb-4">🚨 High Priority Requests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {highPriorityRequests.map((request) => (
              <Card key={request.id} className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{request.title}</h3>
                      <p className="text-sm text-gray-600">{request.property?.name || 'Property not found'}</p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(request.status)} className="text-gray-800 font-semibold">
                      {request.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Category:</span>
                      <span className={`text-sm font-medium ${getCategoryColor(request.category)}`}>
                        {request.category}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Priority:</span>
                      <span className={`text-sm font-bold ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Requested:</span>
                      <span className="text-sm">{new Date(request.requestedDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setSelectedRequest(request)
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
      )}

      {/* Open Requests Section */}
      {openRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-blue-600 mb-4">📋 Open Requests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {openRequests.map((request) => (
              <Card key={request.id} className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{request.title}</h3>
                      <p className="text-sm text-gray-600">{request.property?.name || 'Property not found'}</p>
                      <p className="text-sm text-gray-600">{request.tenant ? `${request.tenant.firstName} ${request.tenant.lastName}` : 'No tenant assigned'}</p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(request.status)} className="text-gray-800 font-semibold">
                      {request.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Category:</span>
                      <span className={`text-sm font-medium ${getCategoryColor(request.category)}`}>
                        {request.category}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Priority:</span>
                      <span className={`text-sm font-bold ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                    </div>
                    {request.estimatedCost && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Est. Cost:</span>
                        <span className="text-sm font-medium">${request.estimatedCost.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button 
                      size="sm" 
                      onClick={() => handleStatusUpdate(request.id, 'IN_PROGRESS')}
                    >
                      Start Work
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setSelectedRequest(request)
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

      {/* In Progress and Scheduled Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* In Progress */}
        <div>
          <h2 className="text-xl font-semibold text-orange-600 mb-4">⚠️ In Progress</h2>
          <div className="space-y-3">
            {inProgressRequests.map((request) => (
              <Card key={request.id} className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{request.title}</h3>
                      <p className="text-sm text-gray-600">{request.property?.name || 'Property not found'}</p>
                      {request.assignedTo && (
                        <p className="text-sm text-blue-600 font-medium">Assigned to: {request.assignedTo}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant={getStatusBadgeVariant(request.status)} className="text-gray-800 font-semibold">
                        {request.status.replace('_', ' ')}
                      </Badge>
                      <p className={`text-xs font-medium mt-1 ${getPriorityColor(request.priority)}`}>
                        {request.priority} Priority
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="sm" 
                      onClick={() => handleStatusUpdate(request.id, 'COMPLETED')}
                    >
                      Mark Complete
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setSelectedRequest(request)
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

        {/* Scheduled */}
        <div>
          <h2 className="text-xl font-semibold text-purple-600 mb-4">📅 Scheduled</h2>
          <div className="space-y-3">
            {scheduledRequests.map((request) => (
              <Card key={request.id} className="border-purple-200 bg-purple-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{request.title}</h3>
                      <p className="text-sm text-gray-600">{request.property?.name || 'Property not found'}</p>
                      {request.assignedTo && (
                        <p className="text-sm text-blue-600 font-medium">Assigned to: {request.assignedTo}</p>
                      )}
                      {request.scheduledDate && (
                        <p className="text-sm text-purple-600 font-medium">
                          Scheduled: {new Date(request.scheduledDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant={getStatusBadgeVariant(request.status)} className="text-gray-800 font-semibold">
                        {request.status}
                      </Badge>
                      <p className={`text-xs font-medium mt-1 ${getPriorityColor(request.priority)}`}>
                        {request.priority} Priority
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="sm" 
                      onClick={() => handleStatusUpdate(request.id, 'IN_PROGRESS')}
                    >
                      Start Work
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setSelectedRequest(request)
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
      </div>

      {/* Recent Completed Requests */}
      {completedRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-green-600 mb-4">✅ Recently Completed</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedRequests.slice(0, 6).map((request) => (
              <Card key={request.id} className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{request.title}</h3>
                      <p className="text-sm text-gray-600">{request.property?.name || 'Property not found'}</p>
                      {request.assignedTo && (
                        <p className="text-sm text-blue-600">Completed by: {request.assignedTo}</p>
                      )}
                    </div>
                    <Badge variant={getStatusBadgeVariant(request.status)} className="text-gray-800 font-semibold">
                      {request.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Completed:</span>
                      <span className="text-sm">{request.completedDate ? new Date(request.completedDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    {request.actualCost && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Cost:</span>
                        <span className="text-sm font-medium">${request.actualCost.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setSelectedRequest(request)
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
      )}

      {/* Modals */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Create Maintenance Request"
      >
        <MaintenanceForm 
          onSubmit={handleAddRequest}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingRequest(null)
        }}
        title="Edit Maintenance Request"
      >
        {editingRequest && (
          <MaintenanceForm 
            request={editingRequest}
            onSubmit={handleEditRequest}
            onCancel={() => {
              setIsEditModalOpen(false)
              setEditingRequest(null)
            }}
          />
        )}
      </Modal>

      {selectedRequest && (
        <MaintenanceDetailsModal
          request={selectedRequest}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false)
            setSelectedRequest(null)
          }}
          onEdit={(request: MaintenanceRequest) => {
            setEditingRequest(request)
            setIsDetailsModalOpen(false)
            setIsEditModalOpen(true)
          }}
          onDelete={handleDeleteRequest}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  )
}