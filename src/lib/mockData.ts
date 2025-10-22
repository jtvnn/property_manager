// Shared mock data for all APIs to ensure consistency and persistence

export let mockTenants = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    dateOfBirth: '1985-03-15',
    emergencyContactName: 'Jane Smith',
    emergencyContactPhone: '(555) 987-6543',
    notes: 'Excellent tenant, always pays on time',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    leases: [
      {
        id: '1',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        monthlyRent: 1200,
        securityDeposit: 1200,
        status: 'ACTIVE',
        propertyId: '1',
        property: {
          id: '1',
          name: 'Sunset Apartments Unit 1A',
          address: '123 Main Street, Unit 1A',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701'
        }
      }
    ]
  },
  {
    id: '2',
    firstName: 'Emily',
    lastName: 'Johnson',
    email: 'emily.johnson@email.com',
    phone: '(555) 234-5678',
    dateOfBirth: '1990-07-22',
    emergencyContactName: 'Mike Johnson',
    emergencyContactPhone: '(555) 876-5432',
    notes: 'New tenant, moved in last month',
    createdAt: '2024-09-01T00:00:00Z',
    updatedAt: '2024-09-01T00:00:00Z',
    leases: [
      {
        id: '2',
        startDate: '2024-09-01',
        endDate: '2025-08-31',
        monthlyRent: 1500,
        securityDeposit: 1500,
        status: 'ACTIVE',
        propertyId: '2',
        property: {
          id: '2',
          name: 'Oak Ridge Townhome',
          address: '456 Oak Avenue',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62702'
        }
      }
    ]
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Davis',
    email: 'michael.davis@email.com',
    phone: '(555) 345-6789',
    dateOfBirth: '1988-12-10',
    emergencyContactName: 'Sarah Davis',
    emergencyContactPhone: '(555) 765-4321',
    notes: 'Previous tenant, lease ended last month',
    createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2024-09-30T00:00:00Z',
    leases: [
      {
        id: '3',
        startDate: '2023-06-01',
        endDate: '2024-05-31',
        monthlyRent: 900,
        securityDeposit: 900,
        status: 'EXPIRED',
        propertyId: '3',
        property: {
          id: '3',
          name: 'Downtown Studio',
          address: '789 City Center Blvd',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62703'
        }
      }
    ]
  }
]

export let mockProperties = [
  {
    id: '1',
    name: 'Sunset Apartments Unit 1A',
    address: '123 Main Street, Unit 1A',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701',
    type: 'APARTMENT',
    bedrooms: 2,
    bathrooms: 1.5,
    squareFeet: 950,
    description: 'Beautiful 2-bedroom apartment with modern amenities',
    imageUrl: null,
    rentAmount: 1200.00,
    status: 'OCCUPIED',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Oak Ridge Townhome',
    address: '456 Oak Avenue',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62702',
    type: 'HOUSE',
    bedrooms: 3,
    bathrooms: 2.5,
    squareFeet: 1400,
    description: 'Spacious townhome with garage and backyard',
    imageUrl: null,
    rentAmount: 1500.00,
    status: 'OCCUPIED',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Downtown Studio',
    address: '789 City Center Blvd',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62703',
    type: 'STUDIO',
    bedrooms: 0,
    bathrooms: 1,
    squareFeet: 600,
    description: 'Modern studio in the heart of downtown',
    imageUrl: null,
    rentAmount: 900.00,
    status: 'MAINTENANCE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

export let mockLeases = [
  {
    id: '1',
    tenantId: '1',
    propertyId: '1',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    monthlyRent: 1200,
    securityDeposit: 1200,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    tenantId: '2',
    propertyId: '2',
    startDate: '2024-02-01',
    endDate: '2025-01-31',
    monthlyRent: 1500,
    securityDeposit: 1500,
    status: 'ACTIVE',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
  },
  {
    id: '3',
    tenantId: '3',
    propertyId: '3',
    startDate: '2024-03-01',
    endDate: '2025-02-28',
    monthlyRent: 950,
    securityDeposit: 950,
    status: 'ACTIVE',
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
  }
]

export let mockPayments = [
  {
    id: '1',
    amount: 1200,
    type: 'RENT',
    status: 'PAID',
    dueDate: '2025-10-01',
    paidDate: '2025-09-30',
    method: 'BANK_TRANSFER',
    notes: 'October rent payment',
    tenantId: '1',
    leaseId: '1',
    tenant: {
      firstName: 'John',
      lastName: 'Smith'
    },
    lease: {
      property: {
        name: 'Sunset Apartments Unit 1A'
      }
    },
    createdAt: '2025-09-30T00:00:00Z',
    updatedAt: '2025-09-30T00:00:00Z'
  },
  {
    id: '2',
    amount: 1200,
    type: 'RENT',
    status: 'PENDING',
    dueDate: '2025-11-01',
    method: null,
    notes: 'November rent payment',
    tenantId: '1',
    leaseId: '1',
    tenant: {
      firstName: 'John',
      lastName: 'Smith'
    },
    lease: {
      property: {
        name: 'Sunset Apartments Unit 1A'
      }
    },
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2025-10-01T00:00:00Z'
  },
  {
    id: '3',
    amount: 1500,
    type: 'RENT',
    status: 'PAID',
    dueDate: '2025-10-01',
    paidDate: '2025-09-28',
    method: 'CHECK',
    notes: 'October rent payment - paid early',
    tenantId: '2',
    leaseId: '2',
    tenant: {
      firstName: 'Emily',
      lastName: 'Johnson'
    },
    lease: {
      property: {
        name: 'Oak Ridge Townhome'
      }
    },
    createdAt: '2025-09-28T00:00:00Z',
    updatedAt: '2025-09-28T00:00:00Z'
  },
  {
    id: '4',
    amount: 1500,
    type: 'RENT',
    status: 'PENDING',
    dueDate: '2025-11-01',
    method: null,
    notes: 'November rent payment',
    tenantId: '2',
    leaseId: '2',
    tenant: {
      firstName: 'Emily',
      lastName: 'Johnson'
    },
    lease: {
      property: {
        name: 'Oak Ridge Townhome'
      }
    },
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2025-10-01T00:00:00Z'
  },
  {
    id: '5',
    amount: 1200,
    type: 'RENT',
    status: 'PENDING',
    dueDate: '2025-12-01',
    method: null,
    notes: 'December rent payment',
    tenantId: '1',
    leaseId: '1',
    tenant: {
      firstName: 'John',
      lastName: 'Smith'
    },
    lease: {
      property: {
        name: 'Sunset Apartments Unit 1A'
      }
    },
    createdAt: '2025-11-01T00:00:00Z',
    updatedAt: '2025-11-01T00:00:00Z'
  },
  {
    id: '6',
    amount: 1500,
    type: 'RENT',
    status: 'PENDING',
    dueDate: '2025-12-01',
    method: null,
    notes: 'December rent payment',
    tenantId: '2',
    leaseId: '2',
    tenant: {
      firstName: 'Emily',
      lastName: 'Johnson'
    },
    lease: {
      property: {
        name: 'Oak Ridge Townhome'
      }
    },
    createdAt: '2025-11-01T00:00:00Z',
    updatedAt: '2025-11-01T00:00:00Z'
  }
]