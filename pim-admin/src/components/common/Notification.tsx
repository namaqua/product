'use client';

import { Fragment, useEffect, useState } from 'react';
import { Transition } from '@headlessui/react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { classNames } from '@/utils/classNames';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationProps {
  id?: string;
  type: NotificationType;
  title: string;
  message?: string;
  show: boolean;
  autoClose?: boolean;
  duration?: number;
  onClose?: () => void;
  actions?: {
    label: string;
    onClick: () => void;
  }[];
}

const icons = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
};

const colors = {
  success: 'text-green-600',
  error: 'text-red-600',
  warning: 'text-yellow-600',
  info: 'text-blue-600',
};

export default function Notification({
  type = 'info',
  title,
  message,
  show,
  autoClose = true,
  duration = 5000,
  onClose,
  actions,
}: NotificationProps) {
  const [visible, setVisible] = useState(show);
  const Icon = icons[type];

  useEffect(() => {
    setVisible(show);

    if (show && autoClose && duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, autoClose, duration, onClose]);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  return (
    <Transition
      show={visible}
      as={Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Icon className={classNames('h-6 w-6', colors[type])} aria-hidden="true" />
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-gray-900">{title}</p>
              {message && <p className="mt-1 text-sm text-gray-500">{message}</p>}
              {actions && actions.length > 0 && (
                <div className="mt-3 flex space-x-7">
                  {actions.map((action, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={action.onClick}
                      className="rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="ml-4 flex flex-shrink-0">
              <button
                className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={handleClose}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
}

// Container component for positioning notifications
export function NotificationContainer({ children }: { children: React.ReactNode }) {
  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-50"
    >
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">{children}</div>
    </div>
  );
}
