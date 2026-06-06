export function formatNumber(value?: number, decimals = 2) {
  return Number(value || 0).toFixed(decimals);
}

export function formatPrice(price?: number) {
  return `₹${formatNumber(price)}`;
}