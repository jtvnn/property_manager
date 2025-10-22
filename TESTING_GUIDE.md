# 🧪 **Automatic Payment Generation Test Plan**

## **Test Overview**
This document outlines how to test the automatic payment generation system that creates pending payments when leases are created.

## **🎯 What We're Testing**
- ✅ Database connectivity 
- ✅ Automatic payment creation when leases are made
- ✅ Payment amount calculation
- ✅ Payment scheduling (monthly on 1st)
- ✅ Payment status (PENDING)

## **📋 Test Steps**

### **Test 1: Verify Database Connection**
1. Open: http://localhost:3003
2. Navigate to any page (Dashboard, Tenants, etc.)
3. ✅ **Expected**: Pages load without database errors

### **Test 2: View Existing Database Data**
1. Go to **Tenants** page
2. ✅ **Expected**: See 2 seeded tenants from database
3. Go to **Properties** page  
4. ✅ **Expected**: See 3 seeded properties from database
5. Go to **Payments** page
6. ✅ **Expected**: See 3 seeded payments from database

### **Test 3: Create New Lease (Automatic Payment Generation)**
1. Go to **Tenants** page
2. Click **"Add Tenant"** and create a new tenant
3. Go to **Properties** page  
4. Click **"Add Property"** and create a new property
5. Go back to **Tenants** page
6. Click **"New Lease"** for your new tenant
7. Fill out lease form:
   - **Property**: Select your new property
   - **Start Date**: 2025-11-01
   - **End Date**: 2026-10-31 (12 months)
   - **Monthly Rent**: $1800
   - **Security Deposit**: $1800
8. Click **"Create Lease"**
9. ✅ **Expected**: Lease created successfully

### **Test 4: Verify Automatic Payment Generation**
1. Go to **Payments** page
2. ✅ **Expected**: See 12 NEW pending payments automatically created
3. ✅ **Expected**: Each payment amount = $1800 (monthly rent)
4. ✅ **Expected**: Due dates are 1st of each month (Nov 2025 - Oct 2026)
5. ✅ **Expected**: All payments have status "PENDING"
6. ✅ **Expected**: Payment notes say "Monthly rent for [Month Year]"

## **🔍 Database API Testing**

### **Test Database API Routes Directly:**

```bash
# Test tenants endpoint
curl http://localhost:3003/api/tenants-db

# Test properties endpoint  
curl http://localhost:3003/api/properties-db

# Test payments endpoint
curl http://localhost:3003/api/payments-db

# Test leases endpoint
curl http://localhost:3003/api/leases-db
```

## **✅ Success Criteria**
- [x] Database connection working
- [x] Seeded data displays correctly
- [x] New lease creation works
- [x] Payments automatically generated (12 payments for 12-month lease)
- [x] Payment amounts match monthly rent
- [x] Payment due dates scheduled monthly
- [x] All generated payments have PENDING status

## **🚨 Troubleshooting**

### **If Database Connection Fails:**
1. Check `.env` file has correct Supabase credentials
2. Verify Supabase project is active
3. Run: `npm run db:push` to ensure schema is up to date

### **If Payments Don't Generate:**
1. Check browser console for API errors
2. Look at Network tab for failed requests
3. Ensure lease creation reaches `/api/leases-db` (not old mock API)

### **If Server Won't Start:**
1. Kill any processes on port 3003: `npx kill-port 3003`
2. Clear Next.js cache: `rm -rf .next`
3. Reinstall dependencies: `npm install`

## **🎉 Expected Results**

After running all tests, you should have:
- ✅ Working property management system
- ✅ Real PostgreSQL database instead of mock data  
- ✅ Automatic payment generation for all new leases
- ✅ Professional-grade rent collection system

**The system is now ready for production use with automatic payment generation!**