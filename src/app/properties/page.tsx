'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PropertyForm } from '@/components/PropertyForm'
import { PropertyDetailsModal } from '@/components/PropertyDetailsModal'

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

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  useEffect(() => {
    async function fetchProperties() {
      try {
        const response = await fetch('/api/properties')
        if (response.ok) {
          const propertiesData = await response.json()
          setProperties(propertiesData)
        }
      } catch (error) {
        console.error('Failed to fetch properties:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

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

  const formatPropertyType = (type: string) => {
    return type.charAt(0) + type.slice(1).toLowerCase()
  }

  const handleAddProperty = async (propertyData: Omit<Property, 'id' | 'imageUrl' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      })

      if (response.ok) {
        const newProperty = await response.json()
        setProperties(prev => [...prev, newProperty])
      }
    } catch (error) {
      console.error('Failed to add property:', error)
    }
  }

  const handleEditProperty = async (propertyData: Omit<Property, 'id' | 'imageUrl' | 'createdAt' | 'updatedAt'>) => {
    if (!editingProperty) return

    try {
      const response = await fetch(`/api/properties/${editingProperty.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      })

      if (response.ok) {
        const updatedProperty = await response.json()
        setProperties(prev => 
          prev.map(p => p.id === editingProperty.id ? updatedProperty : p)
        )
        setEditingProperty(null)
      }
    } catch (error) {
      console.error('Failed to update property:', error)
    }
  }

  const openEditModal = (property: Property) => {
    setEditingProperty(property)
    setShowEditForm(true)
  }

  const closeEditModal = () => {
    setShowEditForm(false)
    setEditingProperty(null)
  }

  const openDetailsModal = (property: Property) => {
    setSelectedProperty(property)
    setShowDetailsModal(true)
  }

  const closeDetailsModal = () => {
    setShowDetailsModal(false)
    setSelectedProperty(null)
  }

  const handleDeleteProperty = async (property: Property) => {
    try {
      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove the property from the local state
        setProperties(prev => prev.filter(p => p.id !== property.id))
      }
    } catch (error) {
      console.error('Failed to delete property:', error)
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

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600">Manage your rental property portfolio</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          + Add Property
        </button>
      </div>

      {/* Properties Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">
              {properties.length}
            </div>
            <p className="text-sm text-gray-600">Total Properties</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {properties.filter(p => p.status === 'OCCUPIED').length}
            </div>
            <p className="text-sm text-gray-600">Occupied</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {properties.filter(p => p.status === 'AVAILABLE').length}
            </div>
            <p className="text-sm text-gray-600">Available</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {properties.filter(p => p.status === 'MAINTENANCE').length}
            </div>
            <p className="text-sm text-gray-600">In Maintenance</p>
          </CardContent>
        </Card>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Card key={property.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{property.name}</CardTitle>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                  {property.status}
                </span>
              </div>
              <CardDescription>
                {property.address}, {property.city}, {property.state} {property.zipCode}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className="text-sm font-medium">{formatPropertyType(property.type)}</span>
                </div>
                
                {property.bedrooms !== null && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bedrooms:</span>
                    <span className="text-sm font-medium">{property.bedrooms}</span>
                  </div>
                )}
                
                {property.bathrooms !== null && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bathrooms:</span>
                    <span className="text-sm font-medium">{property.bathrooms}</span>
                  </div>
                )}
                
                {property.squareFeet !== null && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Square Feet:</span>
                    <span className="text-sm font-medium">{property.squareFeet.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-gray-600">Rent:</span>
                  <span className="text-lg font-bold text-green-600">
                    ${property.rentAmount.toLocaleString()}/mo
                  </span>
                </div>
                
                {property.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {property.description}
                  </p>
                )}
              </div>
              
              <div className="flex space-x-2 mt-4">
                <button 
                  onClick={() => openDetailsModal(property)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm font-medium"
                >
                  View Details
                </button>
                <button 
                  onClick={() => openEditModal(property)}
                  className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded text-sm font-medium"
                >
                  Edit
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {properties.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏠</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties yet</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first rental property</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Add Your First Property
          </button>
        </div>
      )}

      {/* Add Property Modal */}
      <PropertyForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleAddProperty}
        title="Add New Property"
      />

      {/* Edit Property Modal */}
      <PropertyForm
        isOpen={showEditForm}
        onClose={closeEditModal}
        onSubmit={handleEditProperty}
        property={editingProperty}
        title="Edit Property"
      />

      {/* Property Details Modal */}
      <PropertyDetailsModal
        isOpen={showDetailsModal}
        onClose={closeDetailsModal}
        property={selectedProperty}
        onEdit={openEditModal}
        onDelete={handleDeleteProperty}
      />
    </div>
  )
}