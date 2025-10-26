#!/usr/bin/env node

const express = require('express');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Data directory
const dataDir = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Fallback data
const fallbackData = {
  properties: [
    { id: '1', name: 'Sunset Apartments', address: '123 Main St', type: 'Apartment', bedrooms: 2, bathrooms: 1, rent: 1200, status: 'OCCUPIED' },
    { id: '2', name: 'Garden Villa', address: '456 Oak Ave', type: 'House', bedrooms: 3, bathrooms: 2, rent: 1800, status: 'OCCUPIED' },
    { id: '3', name: 'City Loft', address: '789 Pine St', type: 'Apartment', bedrooms: 1, bathrooms: 1, rent: 1000, status: 'VACANT' }
  ],
  tenants: [
    { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@email.com', phone: '555-0101' },
    { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@email.com', phone: '555-0102' }
  ],
  leases: [
    { id: '1', propertyId: '1', tenantId: '1', startDate: '2024-01-01', endDate: '2024-12-31', monthlyRent: 1200, securityDeposit: 1200, status: 'ACTIVE' },
    { id: '2', propertyId: '2', tenantId: '2', startDate: '2024-02-01', endDate: '2025-01-31', monthlyRent: 1800, securityDeposit: 1800, status: 'ACTIVE' }
  ],
  payments: [
    { id: '1', leaseId: '1', tenantId: '1', amount: 1200, dueDate: '2025-11-01', status: 'PENDING', type: 'RENT' },
    { id: '2', leaseId: '2', tenantId: '2', amount: 1800, dueDate: '2025-11-01', status: 'PENDING', type: 'RENT' },
    { id: '3', leaseId: '1', tenantId: '1', amount: 1200, dueDate: '2025-10-01', status: 'PAID', type: 'RENT', paidDate: '2025-09-28' }
  ],
  maintenance: [
    { id: '1', propertyId: '1', tenantId: '1', title: 'Leaky Faucet', description: 'Kitchen faucet is dripping', priority: 'MEDIUM', status: 'PENDING', dateReported: '2025-10-20' }
  ]
};

// Helper function to read JSON files safely
function readJsonFile(filename) {
  const filePath = path.join(dataDir, filename);
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
    return fallbackData[filename.replace('.json', '')] || [];
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return fallbackData[filename.replace('.json', '')] || [];
  }
}

// Helper function to write JSON files
function writeJsonFile(filename, data) {
  const filePath = path.join(dataDir, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
}

// Dashboard API
app.get('/api/dashboard', (req, res) => {
  try {
    const properties = readJsonFile('properties.json');
    const tenants = readJsonFile('tenants.json');
    const leases = readJsonFile('leases.json');
    const allPayments = readJsonFile('payments.json');
    const maintenance = readJsonFile('maintenance.json');

    const totalProperties = properties.length;
    const totalTenants = tenants.length;
    const activeLeases = leases.filter(lease => lease.status === 'ACTIVE');
    
    // Calculate occupied properties
    const occupiedPropertyIds = new Set(activeLeases.map(lease => lease.propertyId));
    const occupiedProperties = occupiedPropertyIds.size;
    const occupancyRate = totalProperties > 0 ? Math.round((occupiedProperties / totalProperties) * 100) : 0;
    const totalMonthlyIncome = activeLeases.reduce((sum, lease) => sum + lease.monthlyRent, 0);

    // Get current month for pending payments
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const pendingPayments = allPayments.filter(payment => {
      if (payment.status !== 'PENDING') return false;
      const dueDate = new Date(payment.dueDate);
      return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear;
    }).length;

    const pendingMaintenance = maintenance.filter(req => req.status === 'PENDING').length;

    // Recent payments (last 5)
    const recentPayments = allPayments
      .filter(payment => payment.status === 'PAID')
      .sort((a, b) => new Date(b.paidDate) - new Date(a.paidDate))
      .slice(0, 5)
      .map(payment => {
        const lease = leases.find(l => l.id === payment.leaseId);
        const tenant = tenants.find(t => t.id === payment.tenantId);
        const property = properties.find(p => p.id === lease?.propertyId);
        
        return {
          ...payment,
          tenant: tenant ? { firstName: tenant.firstName, lastName: tenant.lastName } : null,
          lease: lease && property ? { property: { name: property.name } } : null
        };
      });

    // Upcoming payments (next 5)
    const upcomingPayments = allPayments
      .filter(payment => payment.status === 'PENDING')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5)
      .map(payment => {
        const lease = leases.find(l => l.id === payment.leaseId);
        const tenant = tenants.find(t => t.id === payment.tenantId);
        const property = properties.find(p => p.id === lease?.propertyId);
        
        return {
          ...payment,
          tenant: tenant ? { firstName: tenant.firstName, lastName: tenant.lastName } : null,
          lease: lease && property ? { property: { name: property.name } } : null
        };
      });

    res.json({
      metrics: {
        totalProperties,
        occupiedProperties,
        totalTenants,
        pendingPayments,
        openMaintenanceRequests: pendingMaintenance,
        occupancyRate,
        totalMonthlyIncome
      },
      recentPayments,
      upcomingPayments
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Properties API
app.get('/api/properties', (req, res) => {
  const properties = readJsonFile('properties.json');
  res.json(properties);
});

app.post('/api/properties', (req, res) => {
  const properties = readJsonFile('properties.json');
  const newProperty = {
    id: Date.now().toString(),
    ...req.body
  };
  properties.push(newProperty);
  if (writeJsonFile('properties.json', properties)) {
    res.status(201).json(newProperty);
  } else {
    res.status(500).json({ error: 'Failed to save property' });
  }
});

// Tenants API
app.get('/api/tenants', (req, res) => {
  const tenants = readJsonFile('tenants.json');
  res.json(tenants);
});

app.post('/api/tenants', (req, res) => {
  const tenants = readJsonFile('tenants.json');
  const newTenant = {
    id: Date.now().toString(),
    ...req.body
  };
  tenants.push(newTenant);
  if (writeJsonFile('tenants.json', tenants)) {
    res.status(201).json(newTenant);
  } else {
    res.status(500).json({ error: 'Failed to save tenant' });
  }
});

// Payments API
app.get('/api/payments', (req, res) => {
  const payments = readJsonFile('payments.json');
  res.json(payments);
});

// Maintenance API
app.get('/api/maintenance', (req, res) => {
  const maintenance = readJsonFile('maintenance.json');
  res.json(maintenance);
});

// Serve the HTML file for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Property Manager Server running on http://localhost:${PORT}`);
  console.log(`📁 Data directory: ${dataDir}`);
  
  // Auto-open browser (optional)
  const open = require('open');
  open(`http://localhost:${PORT}`).catch(() => {
    console.log('Could not auto-open browser. Please visit http://localhost:3000 manually.');
  });
});