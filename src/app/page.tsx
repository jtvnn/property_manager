export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Marlow&apos;s Property Management
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Comprehensive property management system for small businesses
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Property Management</h3>
            <p className="text-gray-600 mb-4">
              Track and manage your rental properties with ease
            </p>
            <a href="/properties" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Manage Properties
            </a>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tenant Management</h3>
            <p className="text-gray-600 mb-4">
              Keep track of tenants, leases, and rental agreements
            </p>
            <a href="/tenants" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Manage Tenants
            </a>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Tracking</h3>
            <p className="text-gray-600 mb-4">
              Monitor rent payments, expenses, and generate financial reports
            </p>
            <a href="/payments" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Track Payments
            </a>
          </div>
        </div>
        
        <div className="mt-12">
          <a href="/dashboard" className="inline-flex items-center px-6 py-3 bg-green-600 text-white text-lg rounded-md hover:bg-green-700">
            View Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
