/**
 * Formatting utilities
 */

export function formatPrice(amount: number, currency = 'AED'): string {
  return `${currency} ${amount.toLocaleString()}`;
}

export function formatArea(sqft: number): string {
  return `${sqft.toLocaleString()} sqft`;
}
