// src/lib/socket.ts

import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { NextApiResponse } from 'next';

let io: SocketIOServer | null = null;

export function initSocket(server: HTTPServer): SocketIOServer {
  if (!io) {
    io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
      path: '/api/socket',
    });

    io.on('connection', (socket) => {
      console.log('🔌 Client connected:', socket.id);

      socket.on('join-branch', (branchId: number) => {
        socket.join(`branch-${branchId}`);
        console.log(`Client ${socket.id} joined branch ${branchId}`);
      });

      socket.on('join-user', (userId: number) => {
        socket.join(`user-${userId}`);
        console.log(`Client ${socket.id} joined user ${userId}`);
      });

      socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id);
      });
    });
  }
  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

// Notification types
export interface NotificationPayload {
  type: 'order' | 'stock' | 'payment' | 'attendance' | 'approval' | 'alert';
  title: string;
  message: string;
  data?: any;
  branchId?: number;
  userId?: number;
  createdAt?: string;
}

export function sendNotification(payload: NotificationPayload): void {
  if (!io) {
    console.warn('⚠️ Socket.io not initialized');
    return;
  }

  const { branchId, userId, ...rest } = payload;

  // Send to specific branch
  if (branchId) {
    io.to(`branch-${branchId}`).emit('notification', {
      ...rest,
      branchId,
      createdAt: new Date().toISOString(),
    });
  }

  // Send to specific user
  if (userId) {
    io.to(`user-${userId}`).emit('notification', {
      ...rest,
      userId,
      createdAt: new Date().toISOString(),
    });
  }

  // Send to all (if no branch or user specified)
  if (!branchId && !userId) {
    io.emit('notification', {
      ...rest,
      createdAt: new Date().toISOString(),
    });
  }
}