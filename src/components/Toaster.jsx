import { Toaster as HotToaster } from 'react-hot-toast';

export default function Toaster() {
  return (
    <HotToaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--tg-theme-secondary-bg-color, #fff)',
          color: 'var(--tg-theme-text-color, #000)',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          maxWidth: '90vw',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
          duration: 3000,
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
          duration: 5000,
        },
        loading: {
          iconTheme: {
            primary: '#3b82f6',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}

