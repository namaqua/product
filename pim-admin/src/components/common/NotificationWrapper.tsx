import React from 'react';
import BaseNotification from './Notification';

interface NotificationWrapperProps {
  notification: {
    type: 'success' | 'error' | 'info';
    message: string;
  } | null;
  onClose: () => void;
}

interface NotificationProps {
  show: boolean;
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
}

// Named export for user components
export const NotificationWrapper: React.FC<NotificationWrapperProps> = ({ notification, onClose }) => {
  if (!notification) return null;
  
  return (
    <>
      {/* Portal-like positioning to ensure visibility */}
      <div 
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
        style={{ zIndex: 9999 }}
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          <div className="pointer-events-auto">
            <BaseNotification
              type={notification.type}
              title={notification.message}
              show={true}
              autoClose={true}
              duration={3000}
              onClose={onClose}
            />
          </div>
        </div>
      </div>
    </>
  );
};

// Compatibility wrapper for CategoryManagement (default export)
const Notification: React.FC<NotificationProps> = ({ show, type, message, onClose }) => {
  // Map our simple types to the base component's types
  const notificationType = type === 'info' ? 'info' : type === 'error' ? 'error' : 'success';
  
  return (
    <>
      {/* Portal-like positioning to ensure visibility */}
      <div 
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
        style={{ zIndex: 9999 }}
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          <div className="pointer-events-auto">
            <BaseNotification
              type={notificationType}
              title={message}
              show={show}
              autoClose={true}
              duration={3000}
              onClose={onClose}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Notification;
