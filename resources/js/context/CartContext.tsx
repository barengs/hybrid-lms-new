import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Course, CartItem } from '@/types';

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (course: Course) => void;
  removeFromCart: (courseId: string) => void;
  clearCart: () => void;
  isInCart: (courseId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('hlms_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const saveToStorage = (newItems: CartItem[]) => {
    localStorage.setItem('hlms_cart', JSON.stringify(newItems));
  };

  const addToCart = useCallback((course: Course) => {
    setItems((prev) => {
      if (prev.some((item) => item.courseId === course.id)) {
        return prev;
      }
      const newItems = [
        ...prev,
        {
          courseId: course.id,
          course,
          addedAt: new Date().toISOString(),
        },
      ];
      saveToStorage(newItems);
      return newItems;
    });
  }, []);

  const removeFromCart = useCallback((courseId: string) => {
    setItems((prev) => {
      const newItems = prev.filter((item) => item.courseId !== courseId);
      saveToStorage(newItems);
      return newItems;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem('hlms_cart');
  }, []);

  const isInCart = useCallback((courseId: string) => {
    return items.some((item) => item.courseId === courseId);
  }, [items]);

  const totalItems = items.length;
  const totalPrice = items.reduce((sum, item) => {
    return sum + (item.course.discountPrice ?? item.course.price);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
