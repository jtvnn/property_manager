// Date utility - returns actual current date
// Simplified to remove simulation complexity

export function getCurrentDate(): Date {
  return new Date()
}

export function getCurrentMonth(): number {
  return getCurrentDate().getMonth()
}

export function getCurrentYear(): number {
  return getCurrentDate().getFullYear()
}

// Helper to format date for display
export function formatCurrentMonthYear(): string {
  return getCurrentDate().toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  })
}

// Helper to check if a date is in current month
export function isCurrentMonth(dateString: string): boolean {
  const date = new Date(dateString)
  const current = getCurrentDate()
  return date.getMonth() === current.getMonth() && 
         date.getFullYear() === current.getFullYear()
}