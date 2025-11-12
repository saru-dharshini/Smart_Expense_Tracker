const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AUD: 'A$',
  CAD: 'CA$',
};

export const formatCurrency = (amount: number | undefined | null, currency: string): string => {
  const safeAmount = typeof amount === 'number' ? amount : 0;
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;

  return `${symbol}${safeAmount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatCompactCurrency = (
  amount: number | undefined | null,
  currency: string
): string => {
  const safeAmount = typeof amount === 'number' ? amount : 0;
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;

  return `${symbol}${Intl.NumberFormat('en-IN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(safeAmount)}`;
};

export const formatDate = (isoDate: string | null | undefined): string => {
  if (!isoDate) {
    return '-';
  }

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatLongDate = (isoDate: string | null | undefined): string => {
  if (!isoDate) {
    return '-';
  }
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const formatPercent = (value: number | undefined | null): string => {
  const safeValue = typeof value === 'number' ? value : 0;
  return `${safeValue.toFixed(0)}%`;
};

