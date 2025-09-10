import { ButtonHTMLAttributes, ReactNode } from 'react';

function classNames(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'accent' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  icon?: ReactNode;
  children: ReactNode;
  fullWidth?: boolean;
  glow?: boolean; // Add glow effect for bright blue
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  fullWidth = false,
  glow = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors';

  const variantClasses = {
    primary:
      'bg-navy-800 text-white hover:bg-navy-700 focus-visible:outline-navy-800 disabled:bg-navy-300 shadow-navy',
    secondary:
      'bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-gray-600 disabled:bg-gray-50',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600 disabled:bg-red-400',
    ghost: 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-gray-600',
    accent:
      'bg-accent-500 text-white hover:bg-accent-600 focus-visible:outline-accent-500 disabled:bg-accent-300',
    outline:
      'border border-gray-300 text-gray-700 hover:bg-gray-50 focus-visible:outline-gray-600 disabled:bg-gray-50',
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
  const glowClass = glow && variant === 'primary' && !disabled ? 'shadow-bright-blue hover:shadow-lg' : '';

  return (
    <button
      className={classNames(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        widthClass,
        disabledClass,
        glowClass,
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

export default Button;
