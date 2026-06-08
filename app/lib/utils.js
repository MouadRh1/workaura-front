export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 0,
  }).format(price)
}

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'full',
  }).format(new Date(date))
}