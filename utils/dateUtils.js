// utils/dateUtils.js
export function formatDate(dateString) {
    if (!dateString) return "N/A"

    // Use a consistent format that works on both server and client
    const date = new Date(dateString)

    // Check if date is valid
    if (isNaN(date.getTime())) return "N/A"

    // Use toISOString and format manually for consistency
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${month}/${day}/${year}` // Always MM/DD/YYYY format
}

// Alternative: Use Intl.DateTimeFormat with specific locale
export function formatDateConsistent(dateString) {
    if (!dateString) return "N/A"

    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "N/A"

    // Force US locale for consistency
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date)
}