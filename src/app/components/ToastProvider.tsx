'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster 
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1e293b',
          color: '#f1f5f9',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '16px',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#f1f5f9',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#f1f5f9',
          },
        },
        loading: {
          iconTheme: {
            primary: '#3b82f6',
            secondary: '#f1f5f9',
          },
        },
      }}
    />
  );
}