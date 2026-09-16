// Utility helper functions for ShaadiOS

/**
 * Formats YYYY-MM-DD into Indian English date string, e.g. "18 Feb 2027"
 * @param {string} isoDate
 * @returns {string}
 */
export function formatIndianDate(isoDate) {
  if (!isoDate) return ''
  try {
    const parts = isoDate.split('-')
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10)
      const monthIndex = parseInt(parts[1], 10) - 1
      const day = parseInt(parts[2], 10)
      const d = new Date(year, monthIndex, day, 12, 0, 0)
      return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(d)
    }
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(isoDate))
  } catch (e) {
    return isoDate
  }
}

/**
 * Formats a number to Indian Rupee notation (e.g. 540000 -> "₹5,40,000")
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  if (!amount || isNaN(amount)) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Helper to conditionally join CSS class names
 * @param  {...any} classes
 * @returns {string}
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
