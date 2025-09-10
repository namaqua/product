import { Fragment, ReactNode } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

function classNames(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

interface ModalProps {
  open: boolean;
  onClose: (value: boolean) => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  const sizeClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-4xl',
    full: 'sm:max-w-full',
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className={classNames(
                  'relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:p-6',
                  sizeClasses[size],
                )}
              >
                {showCloseButton && (
                  <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                    <button
                      type="button"
                      className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={() => onClose(false)}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                )}
                
                <div>
                  {title && (
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold leading-6 text-gray-900 dark:text-white mb-2"
                    >
                      {title}
                    </Dialog.Title>
                  )}
                  
                  {description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {description}
                    </p>
                  )}
                  
                  {children && (
                    <div className="mt-4">
                      {children}
                    </div>
                  )}
                  
                  {actions && (
                    <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse gap-3">
                      {actions}
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export default Modal;
