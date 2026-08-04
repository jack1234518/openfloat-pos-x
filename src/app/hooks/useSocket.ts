// src/app/hooks/useSocket.ts

'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

interface NotificationPayload {
  type: 'order' | 'stock' | 'payment' | 'attendance' | 'approval' | 'alert';
  title: string;
  message: string;
  data?: any;
  branchId?: number;
  userId?: number;
  createdAt?: string;
}

export function useSocket(branchId?: number, userId?: number) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const notificationSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element for notifications
    if (typeof window !== 'undefined') {
      notificationSound.current = new Audio('/notification.mp3');
    }

    const socketInstance = io({
      path: '/api/socket',
      transports: ['websocket'],
    });

    socketInstance.on('connect', () => {
      console.log('🔌 Socket connected');
      setIsConnected(true);
      
      if (branchId) {
        socketInstance.emit('join-branch', branchId);
      }
      if (userId) {
        socketInstance.emit('join-user', userId);
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('notification', (payload: NotificationPayload) => {
      setNotifications(prev => [payload, ...prev]);
      
      // Show toast notification
      const icon = getNotificationIcon(payload.type);
      toast(payload.message, {
        icon,
        duration: 5000,
        style: {
          background: '#1e293b',
          color: '#f1f5f9',
          border: '1px solid #334155',
        },
      });

      // Play sound
      if (notificationSound.current) {
        notificationSound.current.play().catch(() => {});
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [branchId, userId]);

  const getNotificationIcon = (type: string): string => {
    switch (type) {
      case 'order': return '🛒';
      case 'stock': return '📦';
      case 'payment': return '💰';
      case 'attendance': return '👤';
      case 'approval': return '✅';
      case 'alert': return '⚠️';
      default: return '🔔';
    }
  };

  const sendNotification = (payload: Omit<NotificationPayload, 'createdAt'>) => {
    if (socket && isConnected) {
      socket.emit('send-notification', payload);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markAsRead = (index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  return {
    socket,
    isConnected,
    notifications,
    sendNotification,
    clearNotifications,
    markAsRead,
  };
}