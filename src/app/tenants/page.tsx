'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TenantForm } from '@/components/TenantForm'
import { TenantDetailsModal } from '@/components/TenantDetailsModal'
import { LeaseForm } from '@/components/LeaseForm'

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
  leases: Lease[]
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [showLeaseForm, setShowLeaseForm] = useState(false)
  const [leaseFormTenant, setLeaseFormTenant] = useState<Tenant | null>(null)

  useEffect(() => {
    async function fetchTenants() {
      try {
        const response = await fetch('/api/tenants')
        if (response.ok) {
          const tenantsData = await response.json()
          setTenants(tenantsData)
        }
      } catch (error) {
        console.error('Failed to fetch tenants:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTenants()
  }, [])

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
      month: 'short',
      day: 'numeric'
    })
  }

  const getCurrentLease = (tenant: Tenant) => {
    // Consider both ACTIVE and PENDING leases as current
    const currentLease = tenant.leases.find(lease => lease.status === 'ACTIVE' || lease.status === 'PENDING')
    console.log(`Tenant ${tenant.firstName} ${tenant.lastName}:`, tenant.leases.length, 'leases, current lease:', currentLease?.status)
    return currentLease
  }

  const handleAddTenant = async (tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt' | 'leases'>) => {
    try {
      const response = await fetch('/api/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tenantData),
      })

      if (response.ok) {
        const newTenant = await response.json()
        setTenants(prev => [...prev, newTenant])
      }
    } catch (error) {
      console.error('Failed to add tenant:', error)
    }
  }

  const handleEditTenant = async (tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt' | 'leases'>) => {
    if (!editingTenant) return

    try {
      const response = await fetch(`/api/tenants/${editingTenant.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tenantData),
      })

      if (response.ok) {
        const updatedTenant = await response.json()
        setTenants(prev => 
          prev.map(t => t.id === editingTenant.id ? updatedTenant : t)
        )
        setEditingTenant(null)
      }
    } catch (error) {
      console.error('Failed to update tenant:', error)
    }
  }

  const handleDeleteTenant = async (tenant: Tenant) => {
    try {
      const response = await fetch(`/api/tenants/${tenant.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setTenants(prev => prev.filter(t => t.id !== tenant.id))
      }
    } catch (error) {
      console.error('Failed to delete tenant:', error)
    }
  }

  const openEditModal = (tenant: Tenant) => {
    setEditingTenant(tenant)
    setShowEditForm(true)
  }

  const closeEditModal = () => {
    setShowEditForm(false)
    setEditingTenant(null)
  }

  const openDetailsModal = (tenant: Tenant) => {
    setSelectedTenant(tenant)
    setShowDetailsModal(true)
  }

  const closeDetailsModal = () => {
    setShowDetailsModal(false)
    setSelectedTenant(null)
  }

  const openLeaseForm = (tenant: Tenant) => {
    setLeaseFormTenant(tenant)
    setShowLeaseForm(true)
  }

  const closeLeaseForm = () => {
    setShowLeaseForm(false)
    setLeaseFormTenant(null)
  }

  const handleCreateLease = async (leaseData: {
    tenantId: string
    propertyId: string
    startDate: string
    endDate: string
    monthlyRent: number
    securityDeposit: number
    status: string
  }) => {
    try {
      const response = await fetch('/api/leases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leaseData),
      })

      if (response.ok) {
        // Refresh tenants to get updated lease information
        const tenantsResponse = await fetch('/api/tenants')
        if (tenantsResponse.ok) {
          const tenantsData = await tenantsResponse.json()
          setTenants(tenantsData)
        }
        closeLeaseForm()
      }
    } catch (error) {
      console.error('Failed to create lease:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const activeTenants = tenants.filter(tenant => getCurrentLease(tenant))
  const inactiveTenants = tenants.filter(tenant => !getCurrentLease(tenant))

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-600">Manage your tenant relationships and lease information</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          + Add Tenant
        </button>
      </div>

      {/* Tenant Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">
              {tenants.length}
            </div>
            <p className="text-sm text-gray-600">Total Tenants</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {activeTenants.length}
            </div>
            <p className="text-sm text-gray-600">Active Leases</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {inactiveTenants.length}
            </div>
            <p className="text-sm text-gray-600">Inactive Tenants</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              ${activeTenants.reduce((total, tenant) => {
                const currentLease = getCurrentLease(tenant)
                return total + (currentLease?.monthlyRent || 0)
              }, 0).toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Monthly Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Tenants Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Tenants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTenants.map((tenant) => {
            const currentLease = getCurrentLease(tenant)
            return (
              <Card key={tenant.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      {tenant.firstName} {tenant.lastName}
                    </CardTitle>
                    {currentLease && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLeaseStatusColor(currentLease.status)}`}>
                        {currentLease.status}
                      </span>
                    )}
                  </div>
                  <CardDescription>
                    {tenant.email}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Phone:</span>
                      <span className="text-sm font-medium">{tenant.phone}</span>
                    </div>
                    
                    {currentLease && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Property:</span>
                          <span className="text-sm font-medium text-right">
                            {currentLease.property.name}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Monthly Rent:</span>
                          <span className="text-sm font-medium text-green-600">
                            ${currentLease.monthlyRent.toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Lease End:</span>
                          <span className="text-sm font-medium">
                            {formatDate(currentLease.endDate)}
                          </span>
                        </div>
                      </>
                    )}
                    
                    {tenant.notes && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {tenant.notes}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <button 
                      onClick={() => openDetailsModal(tenant)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm font-medium"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => openEditModal(tenant)}
                      className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded text-sm font-medium"
                    >
                      Edit
                    </button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Inactive Tenants Section */}
      {inactiveTenants.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Previous Tenants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inactiveTenants.map((tenant) => {
              const lastLease = tenant.leases[tenant.leases.length - 1]
              return (
                <Card key={tenant.id} className="hover:shadow-lg transition-shadow opacity-75">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">
                        {tenant.firstName} {tenant.lastName}
                      </CardTitle>
                      {lastLease && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLeaseStatusColor(lastLease.status)}`}>
                          {lastLease.status}
                        </span>
                      )}
                    </div>
                    <CardDescription>
                      {tenant.email}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Phone:</span>
                        <span className="text-sm font-medium">{tenant.phone}</span>
                      </div>
                      
                      {lastLease && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Last Property:</span>
                            <span className="text-sm font-medium text-right">
                              {lastLease.property.name}
                            </span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Lease Ended:</span>
                            <span className="text-sm font-medium">
                              {formatDate(lastLease.endDate)}
                            </span>
                          </div>
                        </>
                      )}
                      
                      {tenant.notes && (
                        <div className="pt-2 border-t">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {tenant.notes}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 mt-4">
                      <button 
                        onClick={() => openDetailsModal(tenant)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm font-medium"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => openLeaseForm(tenant)}
                        className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded text-sm font-medium"
                      >
                        New Lease
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {tenants.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tenants yet</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first tenant</p>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Add Your First Tenant
          </button>
        </div>
      )}

      {/* Add Tenant Modal */}
      <TenantForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleAddTenant}
        title="Add New Tenant"
      />

      {/* Edit Tenant Modal */}
      <TenantForm
        isOpen={showEditForm}
        onClose={closeEditModal}
        onSubmit={handleEditTenant}
        tenant={editingTenant}
        title="Edit Tenant"
      />

      {/* Tenant Details Modal */}
      <TenantDetailsModal
        isOpen={showDetailsModal}
        onClose={closeDetailsModal}
        tenant={selectedTenant}
        onEdit={openEditModal}
        onDelete={handleDeleteTenant}
      />

      {/* Lease Form Modal */}
      {showLeaseForm && leaseFormTenant && (
        <LeaseForm
          tenant={leaseFormTenant}
          onSubmit={handleCreateLease}
          onCancel={closeLeaseForm}
        />
      )}
    </div>
  )
}