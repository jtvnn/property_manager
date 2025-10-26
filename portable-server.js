#!/usr/bin/env node

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory data store (starts with demo data)
let appData = {
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

// Dashboard API
app.get('/api/dashboard', (req, res) => {
  try {
    const { properties, tenants, leases, payments, maintenance } = appData;

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
    
    const pendingPayments = payments.filter(payment => {
      if (payment.status !== 'PENDING') return false;
      const dueDate = new Date(payment.dueDate);
      return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear;
    }).length;

    const pendingMaintenance = maintenance.filter(req => req.status === 'PENDING').length;

    // Recent payments (last 5)
    const recentPayments = payments
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
    const upcomingPayments = payments
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
  res.json(appData.properties);
});

app.post('/api/properties', (req, res) => {
  const newProperty = {
    id: Date.now().toString(),
    ...req.body
  };
  appData.properties.push(newProperty);
  res.status(201).json(newProperty);
});

// Tenants API
app.get('/api/tenants', (req, res) => {
  res.json(appData.tenants);
});

app.post('/api/tenants', (req, res) => {
  const newTenant = {
    id: Date.now().toString(),
    ...req.body
  };
  appData.tenants.push(newTenant);
  res.status(201).json(newTenant);
});

// Payments API
app.get('/api/payments', (req, res) => {
  res.json(appData.payments);
});

app.post('/api/payments', (req, res) => {
  const newPayment = {
    id: Date.now().toString(),
    ...req.body
  };
  appData.payments.push(newPayment);
  res.status(201).json(newPayment);
});

// Maintenance API
app.get('/api/maintenance', (req, res) => {
  res.json(appData.maintenance);
});

app.post('/api/maintenance', (req, res) => {
  const newRequest = {
    id: Date.now().toString(),
    ...req.body
  };
  appData.maintenance.push(newRequest);
  res.status(201).json(newRequest);
});

// Serve basic HTML for all routes
app.get('*', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Property Manager</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 6px; text-align: center; }
        .metric h3 { margin: 0 0 10px 0; color: #666; font-size: 14px; }
        .metric .value { font-size: 24px; font-weight: bold; color: #333; }
        .nav { display: flex; gap: 10px; justify-content: center; margin-bottom: 30px; }
        .nav button { padding: 10px 20px; border: none; background: #007bff; color: white; border-radius: 4px; cursor: pointer; }
        .nav button:hover { background: #0056b3; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        .list-item { background: #f8f9fa; margin: 10px 0; padding: 15px; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏠 Property Manager</h1>
            <p>Portable Property Management System</p>
        </div>
        
        <div class="nav">
            <button onclick="showDashboard()">Dashboard</button>
            <button onclick="showProperties()">Properties</button>
            <button onclick="showTenants()">Tenants</button>
            <button onclick="showPayments()">Payments</button>
            <button onclick="showMaintenance()">Maintenance</button>
        </div>
        
        <div id="content">
            <div class="metrics" id="metrics"></div>
            <div class="section" id="data"></div>
        </div>
    </div>

    <script>
        let currentData = {};
        
        async function fetchData(endpoint) {
            try {
                const response = await fetch('/api/' + endpoint);
                return await response.json();
            } catch (error) {
                console.error('Error:', error);
                return [];
            }
        }
        
        async function showDashboard() {
            const data = await fetchData('dashboard');
            currentData = data;
            
            const metricsHTML = \`
                <div class="metric">
                    <h3>Total Properties</h3>
                    <div class="value">\${data.metrics?.totalProperties || 0}</div>
                </div>
                <div class="metric">
                    <h3>Occupancy Rate</h3>
                    <div class="value">\${data.metrics?.occupancyRate || 0}%</div>
                </div>
                <div class="metric">
                    <h3>Monthly Income</h3>
                    <div class="value">$\${data.metrics?.totalMonthlyIncome?.toLocaleString() || 0}</div>
                </div>
                <div class="metric">
                    <h3>Pending Payments</h3>
                    <div class="value">\${data.metrics?.pendingPayments || 0}</div>
                </div>
            \`;
            
            document.getElementById('metrics').innerHTML = metricsHTML;
            document.getElementById('data').innerHTML = '<h2>📊 Dashboard Overview</h2><p>Welcome to your Property Manager! Use the navigation buttons above to manage your properties, tenants, payments, and maintenance requests.</p>';
        }
        
        async function showProperties() {
            const properties = await fetchData('properties');
            const html = '<h2>🏠 Properties</h2>' + 
                properties.map(p => \`
                    <div class="list-item">
                        <strong>\${p.name}</strong><br>
                        📍 \${p.address}<br>
                        🏠 \${p.type} • \${p.bedrooms} bed, \${p.bathrooms} bath<br>
                        💰 $\${p.rent}/month • Status: \${p.status}
                    </div>
                \`).join('');
            document.getElementById('data').innerHTML = html;
            document.getElementById('metrics').innerHTML = '';
        }
        
        async function showTenants() {
            const tenants = await fetchData('tenants');
            const html = '<h2>👥 Tenants</h2>' + 
                tenants.map(t => \`
                    <div class="list-item">
                        <strong>\${t.firstName} \${t.lastName}</strong><br>
                        📧 \${t.email}<br>
                        📞 \${t.phone}
                    </div>
                \`).join('');
            document.getElementById('data').innerHTML = html;
            document.getElementById('metrics').innerHTML = '';
        }
        
        async function showPayments() {
            const payments = await fetchData('payments');
            const html = '<h2>💳 Payments</h2>' + 
                payments.map(p => \`
                    <div class="list-item">
                        <strong>$\${p.amount}</strong> - \${p.type}<br>
                        📅 Due: \${new Date(p.dueDate).toLocaleDateString()}<br>
                        Status: <span style="color: \${p.status === 'PAID' ? 'green' : 'orange'}">\${p.status}</span>
                        \${p.paidDate ? '<br>✅ Paid: ' + new Date(p.paidDate).toLocaleDateString() : ''}
                    </div>
                \`).join('');
            document.getElementById('data').innerHTML = html;
            document.getElementById('metrics').innerHTML = '';
        }
        
        async function showMaintenance() {
            const maintenance = await fetchData('maintenance');
            const html = '<h2>🔧 Maintenance</h2>' + 
                maintenance.map(m => \`
                    <div class="list-item">
                        <strong>\${m.title}</strong><br>
                        📝 \${m.description}<br>
                        ⚠️ Priority: \${m.priority} • Status: \${m.status}<br>
                        📅 Reported: \${new Date(m.dateReported).toLocaleDateString()}
                    </div>
                \`).join('');
            document.getElementById('data').innerHTML = html;
            document.getElementById('metrics').innerHTML = '';
        }
        
        // Load dashboard by default
        showDashboard();
    </script>
</body>
</html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log('Property Manager Server running on http://localhost:' + PORT);
  console.log('Access your property manager in any web browser!');
  
  // Try to auto-open browser (will fail silently if not available)
  try {
    const { exec } = require('child_process');
    exec('start http://localhost:' + PORT);
  } catch (e) {
    // Ignore errors
  }
});