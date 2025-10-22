import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { AuthProvider } from '@/contexts/auth-context'
import { AuthWrapper } from '@/components/auth-wrapper'
import { UserMenu } from '@/components/user-menu'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Marlow\'s Property Management',
  description: 'Comprehensive property management system for small businesses',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AuthWrapper>
            <div className="min-h-screen bg-gray-50">
              <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center h-16">
                    {/* Title on the far left */}
                    <div className="flex-shrink-0">
                      <Link href="/dashboard" className="flex items-center">
                        <h1 className="text-xl font-bold text-gray-900">Marlow&apos;s Property Management</h1>
                      </Link>
                    </div>
                    
                    {/* Navigation menu in the center-right area */}
                    <div className="flex-1 flex justify-end items-center space-x-8">
                      <nav className="hidden md:flex space-x-8">
                        <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                          Dashboard
                        </Link>
                        <Link href="/properties" className="text-gray-600 hover:text-gray-900">
                          Properties
                        </Link>
                        <Link href="/tenants" className="text-gray-600 hover:text-gray-900">
                          Tenants
                        </Link>
                        <Link href="/payments" className="text-gray-600 hover:text-gray-900">
                          Payments
                        </Link>
                        <Link href="/maintenance" className="text-gray-600 hover:text-gray-900">
                          Maintenance
                        </Link>
                      </nav>
                      <UserMenu />
                    </div>
                  </div>
                </div>
              </header>
              <main>
                {children}
              </main>
            </div>
          </AuthWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}
