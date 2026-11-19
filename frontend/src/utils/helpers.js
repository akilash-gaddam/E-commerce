/**
 * Formatting helpers used across STANDARD.IO pages.
 */
export const formatPrice = (price) => {
  const num = Number(price) || 0;
  return `$${num.toFixed(2)}`;
};

export const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatOrderId = (id) => `ORD-${String(id).padStart(4, '0')}`;

export const STATUS_STAGES = ['Placed', 'Packed', 'Out for Delivery', 'Delivered'];