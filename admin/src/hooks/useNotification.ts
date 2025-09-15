import { useCallback } from 'react';

interface NotificationOptions {
  duration?: number;
  type?: 'success' | 'error' | 'info' | 'warning';
}

export function useNotification() {
  const showNotification = useCallback((message: string, options: NotificationOptions = {}) => {
    const { duration = 3000, type = 'info' } = options;
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all transform translate-x-0 ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      type === 'warning' ? 'bg-yellow-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.opacity = '1';
    }, 10);
    
    // Remove after duration
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, duration);
  }, []);

  const showSuccess = useCallback((message: string) => {
    showNotification(message, { type: 'success' });
  }, [showNotification]);

  const showError = useCallback((message: string) => {
    showNotification(message, { type: 'error' });
  }, [showNotification]);

  const showInfo = useCallback((message: string) => {
    showNotification(message, { type: 'info' });
  }, [showNotification]);

  const showWarning = useCallback((message: string) => {
    showNotification(message, { type: 'warning' });
  }, [showNotification]);

  return {
    showNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
}
