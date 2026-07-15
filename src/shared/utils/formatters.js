/**
 * Utility para formatos
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export const truncate = (text, length = 50) => {
  return text.length > length ? text.substring(0, length) + '...' : text
}

export const formatPhone = (phone) => {
  return phone?.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3') || 'N/A'
}
