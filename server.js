#!/usr/bin/env node

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Serve static files from .next/static if it exists
const nextStaticPath = path.join(__dirname, '.next/static');
if (fs.existsSync(nextStaticPath)) {
  app.use('/_next/static', express.static(nextStaticPath));
}

// Fallback data when files don't exist
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

// Helper function to safely read JSON files
function safeReadJSON(filePath, fallback = []) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
    return fallback;
  } catch (error) {
    console.log(`Using fallback data for ${path.basename(filePath)}`);
    return fallback;
  }
}

// Dashboard API
app.get('/api/dashboard', (req, res) => {
  try {
    const dataPath = path.join(__dirname, 'data');
    
    // Read data files with fallbacks
    const properties = safeReadJSON(path.join(dataPath, 'properties.json'), fallbackData.properties);
    const tenants = safeReadJSON(path.join(dataPath, 'tenants.json'), fallbackData.tenants);
    const leases = safeReadJSON(path.join(dataPath, 'leases.json'), fallbackData.leases);
    const payments = safeReadJSON(path.join(dataPath, 'payments.json'), fallbackData.payments);
    const maintenance = safeReadJSON(path.join(dataPath, 'maintenance.json'), fallbackData.maintenance);

    // Calculate metrics
    const totalProperties = properties.length;
    const totalTenants = tenants.length;
    const activeLeases = leases.filter(lease => lease.status === 'ACTIVE');
    const occupiedPropertyIds = new Set(activeLeases.map(lease => lease.propertyId));
    const occupiedProperties = occupiedPropertyIds.size;
    const occupancyRate = totalProperties > 0 ? Math.round((occupiedProperties / totalProperties) * 100) : 0;
    const totalMonthlyIncome = activeLeases.reduce((sum, lease) => sum + lease.monthlyRent, 0);

    // Get current month pending payments
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const pendingPayments = payments.filter(payment => {
      if (payment.status !== 'PENDING') return false;
      const dueDate = new Date(payment.dueDate);
      return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear;
    }).length;

    const pendingMaintenance = maintenance.filter(req => req.status === 'PENDING').length;
    
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
      recentPayments: payments.slice(0, 5),
      upcomingPayments: payments.filter(p => p.status === 'PENDING').slice(0, 5)
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    // Return fallback data on error
    res.json({
      metrics: {
        totalProperties: 3,
        occupiedProperties: 2,
        totalTenants: 2,
        pendingPayments: 2,
        openMaintenanceRequests: 1,
        occupancyRate: 67,
        totalMonthlyIncome: 3000
      },
      recentPayments: fallbackData.payments.slice(0, 5),
      upcomingPayments: fallbackData.payments.filter(p => p.status === 'PENDING').slice(0, 5)
    });
  }
});

// Serve the main HTML file for all other routes
app.get('*', (req, res) => {
  // Try to serve the built Next.js app first
  const indexPath = path.join(__dirname, '.next/server/app/index.html');
  const publicIndexPath = path.join(__dirname, 'public/index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else if (fs.existsSync(publicIndexPath)) {
    res.sendFile(publicIndexPath);
  } else {
    // Serve a simple HTML page with the property manager
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Property Manager</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; }
        .status { background: #e7f5e7; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #4caf50; }
        .api-links { background: #f0f0f0; padding: 20px; border-radius: 4px; margin: 20px 0; }
        .api-links a { display: block; margin: 5px 0; color: #1976d2; text-decoration: none; }
        .api-links a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏠 Property Manager - Portable App</h1>
        <div class="status">
            <strong>✅ Server Running Successfully!</strong><br>
            Your property management application is running and ready to use.
        </div>
        
        <h2>📊 API Endpoints Available:</h2>
        <div class="api-links">
            <a href="/api/dashboard">📈 Dashboard Data</a>
            <p><em>Click the link above to see your property management data in JSON format.</em></p>
        </div>
        
        <h2>🔧 Technical Info:</h2>
        <ul>
            <li><strong>Server:</strong> Express.js</li>
            <li><strong>Port:</strong> ${PORT}</li>
            <li><strong>Status:</strong> Portable Executable Mode</li>
            <li><strong>Data:</strong> File-based with fallback data</li>
        </ul>
        
        <p><em>This is your property management application running as a portable executable!</em></p>
    </div>
</body>
</html>
    `);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🏠 Property Manager running on http://localhost:${PORT}`);
  console.log('📁 Serving from:', __dirname);
  
  // Try to auto-open browser
  try {
    const { exec } = require('child_process');
    exec(`start http://localhost:${PORT}`, (error) => {
      if (error) {
        console.log('Could not auto-open browser. Please visit http://localhost:' + PORT);
      }
    });
  } catch {
    console.log('Could not auto-open browser. Please visit http://localhost:' + PORT);
  }
});

module.exports = app;