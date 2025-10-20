import React from 'react'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  children: React.ReactNode
}

export function Badge({ 
  className = '', 
  variant = 'default', 
  children, 
  ...props 
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
  
  const variants = {
    default: 'border-transparent bg-green-100 text-green-800',
    secondary: 'border-transparent bg-yellow-100 text-yellow-800',
    destructive: 'border-transparent bg-red-100 text-red-800',
    outline: 'text-foreground border-gray-300'
  }
  
  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}