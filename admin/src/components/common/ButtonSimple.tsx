import { ButtonHTMLAttributes, ReactNode } from 'react';

// Inline classNames function to avoid import issues
function classNames(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  icon?: ReactNode;
  children: ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors';

  const variantClasses = {
    primary:
      'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600 disabled:bg-indigo-400',
    secondary:
      'bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-gray-600 disabled:bg-gray-50',
    danger:
      'bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600 disabled:bg-red-400',
    ghost: 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-gray-600',
  };

  const sizeClasses = {
    xs: 'rounded px-2 py-1 text-xs gap-x-1',
    sm: 'rounded-md px-2.5 py-1.5 text-sm gap-x-1.5',
    md: 'rounded-md px-3 py-2 text-sm gap-x-2',
    lg: 'rounded-md px-3.5 py-2.5 text-sm gap-x-2',
    xl: 'rounded-md px-4 py-3 text-base gap-x-2.5',
  };

  const widthClass = fullWidth ? 'w-full justify-center' : '';
  const disabledClass = disabled ? 'cursor-not-allowed opacity-60' : '';

  return (
    <button
      className={classNames(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        widthClass,
        disabledClass,
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="-ml-0.5">{icon}</span>}
      {children}
    </button>
  );
}
