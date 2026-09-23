"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  slug: string;
  image?: string;
  priceUSD: number;
  priceEUR: number;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotalUSD: number;
  subtotalEUR: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "bbh-cart";

function keyOf(productId: string, variantId?: string) {
  return `${productId}::${variantId ?? ""}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* panier vide */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* stockage indisponible */
    }
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((n, i) => n + i.quantity, 0);
    const subtotalUSD = items.reduce((n, i) => n + i.quantity * i.priceUSD, 0);
    const subtotalEUR = items.reduce((n, i) => n + i.quantity * i.priceEUR, 0);
    return {
      items,
      count,
      subtotalUSD,
      subtotalEUR,
      isOpen,
      openCart() {
        setIsOpen(true);
      },
      closeCart() {
        setIsOpen(false);
      },
      addItem(item, quantity = 1) {
        setItems((prev) => {
          const k = keyOf(item.productId, item.variantId);
          const existing = prev.find((i) => keyOf(i.productId, i.variantId) === k);
          if (existing) {
            return prev.map((i) =>
              keyOf(i.productId, i.variantId) === k
                ? { ...i, quantity: i.quantity + quantity }
                : i
            );
          }
          return [...prev, { ...item, quantity }];
        });
        // Ouvre le mini-panier pour montrer l'article ajouté (avec son visuel),
        // comme sur les sites e-commerce classiques.
        setIsOpen(true);
      },
      removeItem(productId, variantId) {
        const k = keyOf(productId, variantId);
        setItems((prev) => prev.filter((i) => keyOf(i.productId, i.variantId) !== k));
      },
      updateQuantity(productId, variantId, quantity) {
        const k = keyOf(productId, variantId);
        setItems((prev) =>
          quantity <= 0
            ? prev.filter((i) => keyOf(i.productId, i.variantId) !== k)
            : prev.map((i) =>
                keyOf(i.productId, i.variantId) === k ? { ...i, quantity } : i
              )
        );
      },
      clear() {
        setItems([]);
      },
    };
  }, [items, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans <CartProvider>");
  return ctx;
}
