'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ItemKeranjang {
  id: string;
  title: string;
  price: number;
  qty: number;
  size: string;
  color: string;
  image: string;
}

interface KeranjangContextType {
  cartItems: ItemKeranjang[];
  tambahKeKeranjang: (item: Omit<ItemKeranjang, 'qty'>, qty?: number) => void;
  updateQty: (id: string, size: string, color: string, delta: number) => void;
  removeItem: (id: string, size: string, color: string) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
}

const KeranjangContext = createContext<KeranjangContextType | undefined>(undefined);

export function KeranjangProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<ItemKeranjang[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('almaco_keranjang');
      if (saved) {
        setCartItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('almaco_keranjang', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  const tambahKeKeranjang = (newItem: Omit<ItemKeranjang, 'qty'>, qty = 1) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.id === newItem.id && i.size === newItem.size && i.color === newItem.color
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].qty += qty;
        return updated;
      }
      return [...prev, { ...newItem, qty }];
    });
  };

  const updateQty = (id: string, size: string, color: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id && item.size === size && item.color === color) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : item;
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (id: string, size: string, color: string) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.id === id && item.size === size && item.color === color))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <KeranjangContext.Provider
      value={{
        cartItems,
        tambahKeKeranjang,
        updateQty,
        removeItem,
        clearCart,
        totalCount,
        subtotal,
      }}
    >
      {children}
    </KeranjangContext.Provider>
  );
}

export function useKeranjang() {
  const context = useContext(KeranjangContext);
  if (!context) {
    throw new Error('useKeranjang harus digunakan di dalam KeranjangProvider');
  }
  return context;
}





