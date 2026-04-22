import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Notification } from '@/types';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    type: 'announcement',
    title: 'Pengumuman Baru',
    message: 'Instruktur memposting pengumuman baru di kelas React Masterclass',
    link: '/course/1/announcements',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '2',
    userId: '1',
    type: 'assignment',
    title: 'Tugas Baru',
    message: 'Tugas "Membuat Komponen Todo List" telah ditambahkan',
    link: '/course/1/assignments/1',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '3',
    userId: '1',
    type: 'deadline',
    title: 'Tenggat Waktu Mendekat',
    message: 'Tugas "Final Project" akan berakhir dalam 2 hari',
    link: '/course/2/assignments/3',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: '4',
    userId: '1',
    type: 'reply',
    title: 'Balasan Baru',
    message: 'Instruktur menjawab pertanyaan Anda di forum diskusi',
    link: '/course/1/discussions/5',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
      const newNotification: Notification = {
        ...notification,
        id: Math.random().toString(36).substring(7),
        createdAt: new Date().toISOString(),
        isRead: false,
      };
      setNotifications((prev) => [newNotification, ...prev]);
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
