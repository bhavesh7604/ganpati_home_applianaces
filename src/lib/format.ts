export const inr = (n: number | string) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n));

export const discountPct = (price?: number | null, mrp?: number | null) =>
  price != null && mrp != null && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

export const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const STATUS_LABEL: Record<string, string> = {
  placed: 'Order placed', confirmed: 'Confirmed', shipped: 'Shipped',
  delivered: 'Delivered', cancelled: 'Cancelled', returned: 'Returned',
};
