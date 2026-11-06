const currencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactCurrencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const numberFormatter = new Intl.NumberFormat('fr-FR');

export function formatCurrency(value) {
  return currencyFormatter.format(Number(value) || 0);
}

export function formatCompactCurrency(value) {
  return compactCurrencyFormatter.format(Number(value) || 0);
}

export function formatNumber(value) {
  return numberFormatter.format(Number(value) || 0);
}

export function formatDate(value, options = {}) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(date);
}

export function formatDateLong(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(value) {
  return formatDate(value, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const days = Math.round((startOfToday.getTime() - startOfDate.getTime()) / 86400000);

  if (days === 0) {
    return `Aujourd’hui, ${new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)}`;
  }
  if (days === 1) return 'Hier';
  if (days > 1 && days < 7) return `Il y a ${days} jours`;
  return formatDate(value);
}

export function toDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Espèces' },
  { value: 'card', label: 'Carte bancaire' },
  { value: 'transfer', label: 'Virement' },
  { value: 'mobile_money', label: 'Mobile money' },
  { value: 'check', label: 'Chèque' },
];

export const PAYMENT_LABELS = Object.fromEntries(
  PAYMENT_METHODS.map((method) => [method.value, method.label])
);

export const SALE_STATUS = {
  completed: { label: 'Validée', tone: 'success' },
  cancelled: { label: 'Annulée', tone: 'danger' },
};

export const STOCK_STATUS = {
  in: { label: 'En stock', tone: 'success' },
  low: { label: 'Stock faible', tone: 'warning' },
  out: { label: 'Rupture', tone: 'danger' },
};

export const MOVEMENT_TYPES = {
  in: { label: 'Entrée', tone: 'success' },
  out: { label: 'Sortie', tone: 'danger' },
  adjustment: { label: 'Inventaire', tone: 'info' },
};

export const TAX_RATES = [0, 5.5, 10, 20];

export const CATEGORY_COLORS = [
  '#6366f1',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
];
