'use client';
import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';

export type CartLine = {
  key: string; productId: string; slug: string; name: string; price: number; mrp: number | null;
  image: string | null; option: string | null; optionLabel: string; sku: string | null; qty: number;
};
type Action =
  | { type: 'load'; lines: CartLine[] }
  | { type: 'add'; line: CartLine }
  | { type: 'qty'; key: string; qty: number }
  | { type: 'remove'; key: string }
  | { type: 'clear' };

function reducer(state: CartLine[], a: Action): CartLine[] {
  switch (a.type) {
    case 'load': return a.lines;
    case 'add': {
      const found = state.find((l) => l.key === a.line.key);
      if (found) return state.map((l) => (l.key === a.line.key ? { ...l, qty: Math.min(99, l.qty + a.line.qty) } : l));
      return [...state, a.line];
    }
    case 'qty': return state.map((l) => (l.key === a.key ? { ...l, qty: Math.max(1, Math.min(99, a.qty)) } : l));
    case 'remove': return state.filter((l) => l.key !== a.key);
    case 'clear': return [];
  }
}

type Ctx = {
  lines: CartLine[]; count: number; subtotal: number; ready: boolean;
  add: (l: Omit<CartLine, 'key'>) => void; setQty: (key: string, qty: number) => void;
  remove: (key: string) => void; clear: () => void;
};
const CartContext = createContext<Ctx | null>(null);
const KEY = 'gha-cart-v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, dispatch] = useReducer(reducer, []);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) dispatch({ type: 'load', lines: JSON.parse(raw) });
    } catch { /* ignore corrupt data */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) { try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch { /* storage full/blocked */ } }
  }, [lines, ready]);

  const value = useMemo<Ctx>(() => ({
    lines, ready,
    count: lines.reduce((n, l) => n + l.qty, 0),
    subtotal: lines.reduce((n, l) => n + l.price * l.qty, 0),
    add: (l) => dispatch({ type: 'add', line: { ...l, key: `${l.productId}::${l.option ?? ''}` } }),
    setQty: (key, qty) => dispatch({ type: 'qty', key, qty }),
    remove: (key) => dispatch({ type: 'remove', key }),
    clear: () => dispatch({ type: 'clear' }),
  }), [lines, ready]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
