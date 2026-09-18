// Localization utilities for Date, Time, Number and Currency

const getLocale = (): string => {
  return localStorage.getItem('app_language') || 'en-IN';
};

export const formatDate = (dateString: string | Date): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(getLocale(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

export const formatTime = (dateString: string | Date): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(getLocale(), {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);
};

export const formatDateTime = (dateString: string | Date): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(getLocale(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);
};

export const formatCurrency = (amount: number): string => {
  // Always use INR as requested for this project
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0 // Typically round for INR
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat(getLocale()).format(num);
};

export const formatRelativeTime = (dateString: string | Date): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(getLocale(), { numeric: 'auto' });

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  }
};
