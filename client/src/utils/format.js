export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value || 0);
};

export const formatNumber = (value) => {
  return new Intl.NumberFormat('en-US').format(value || 0);
};

export const formatPercent = (value) => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${(value || 0).toFixed(2)}%`;
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
};

export const cn = (...classes) => classes.filter(Boolean).join(' ');
