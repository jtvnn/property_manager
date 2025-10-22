# File-Based Storage System

This property management application uses a simple file-based storage system instead of a traditional database. All data is stored in JSON files in the `data/` directory.

## Data Storage

### JSON Files
- `data/properties.json` - Property information
- `data/tenants.json` - Tenant information  
- `data/leases.json` - Lease agreements
- `data/payments.json` - Payment records
- `data/maintenance.json` - Maintenance requests

### Benefits
- **Simple Setup**: No database installation or configuration required
- **Version Control Friendly**: Data files can be tracked in git
- **Easy Backup**: Simple file copy operations
- **Development Friendly**: Easy to inspect and modify data
- **Portable**: Works anywhere without external dependencies

## API Structure

All API routes have been converted to use file-based operations:

### Main Routes
- `/api/properties` - CRUD operations for properties
- `/api/tenants` - CRUD operations for tenants
- `/api/leases` - CRUD operations for leases (auto-generates payments)
- `/api/payments` - CRUD operations for payments
- `/api/maintenance` - CRUD operations for maintenance requests
- `/api/dashboard` - Aggregated statistics and recent activities

### Individual Item Routes
- `/api/properties/[id]` - Individual property operations
- `/api/tenants/[id]` - Individual tenant operations
- `/api/payments/[id]` - Individual payment operations
- `/api/maintenance/[id]` - Individual maintenance request operations

## Data Relationships

The system maintains relationships between entities:
- **Leases** link properties and tenants
- **Payments** are automatically generated when leases are created
- **Dashboard** aggregates data from all entities for statistics

## Development

To start development:
```bash
npm run dev
```

The application will run on http://localhost:3001 (or 3000 if available).

## Production Considerations

For production use, consider:
- Adding data validation and error handling
- Implementing file locking for concurrent access
- Adding data backup strategies
- Considering migration to a database for larger datasets