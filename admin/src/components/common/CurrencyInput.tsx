import React, { useMemo } from 'react';
import { getCurrencySymbol } from '../../config/currency.config';

interface CurrencyInputProps {
  id: string;
  name?: string;
  value: number | undefined | null | '';
  onChange: (value: string) => void;
  currency: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
}

/**
 * Currency input component that displays the appropriate currency symbol
 * and formats the input for monetary values
 */
export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  id,
  name,
  value,
  onChange,
  currency,
  label,
  placeholder = '0.00',
  required = false,
  disabled = false,
  className = '',
  error
}) => {
  const currencySymbol = useMemo(() => getCurrencySymbol(currency), [currency]);
  
  // Adjust padding based on symbol length
  const inputPadding = useMemo(() => {
    const symbolLength = currencySymbol.length;
    if (symbolLength <= 1) return 'pl-7';
    if (symbolLength <= 2) return 'pl-10';
    return 'pl-12';
  }, [currencySymbol]);

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          <span className="ml-1 text-gray-500">({currency})</span>
        </label>
      )}
      <div className="mt-1 relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500 sm:text-sm">
            {currencySymbol}
          </span>
        </div>
        <input
          type="number"
          id={id}
          name={name || id}
          value={value === null || value === undefined ? '' : value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          step="0.01"
          min="0"
          className={`${inputPadding} block w-full rounded-md ${
            error 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          } shadow-sm sm:text-sm ${disabled ? 'bg-gray-100' : ''}`}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

/**
 * Currency display component for showing formatted currency values
 */
export const CurrencyDisplay: React.FC<{
  amount: number | undefined | null;
  currency: string;
  className?: string;
}> = ({ amount, currency, className = '' }) => {
  const currencySymbol = getCurrencySymbol(currency);
  
  if (amount === null || amount === undefined) {
    return <span className={className}>-</span>;
  }
  
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  // Position symbol based on currency conventions
  let display = '';
  if (currency === 'EUR') {
    display = `€${formattedAmount}`;
  } else if (currency === 'GBP') {
    display = `£${formattedAmount}`;
  } else if (currency === 'USD') {
    display = `$${formattedAmount}`;
  } else if (currency === 'ZAR') {
    display = `R ${formattedAmount}`;
  } else if (currency === 'CHF') {
    display = `CHF ${formattedAmount}`;
  } else {
    display = `${currencySymbol} ${formattedAmount}`;
  }
  
  return <span className={className}>{display}</span>;
};
