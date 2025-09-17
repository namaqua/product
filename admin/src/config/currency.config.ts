// Currency configuration types
export interface Currency {
  code: string;
  name: string;
  symbol: string;
  displayName: string;
}

export interface CurrencyConfig {
  currencies: Currency[];
  defaultCurrency: string;
}

// Import the JSON configuration
import currencyData from './currencies.json';

// Export typed currency configuration
export const currencyConfig: CurrencyConfig = currencyData;

// Helper functions for currency operations
export const getCurrencyByCode = (code: string): Currency | undefined => {
  return currencyConfig.currencies.find(c => c.code === code);
};

export const getCurrencySymbol = (code: string): string => {
  const currency = getCurrencyByCode(code);
  return currency?.symbol || code;
};

export const formatCurrency = (amount: number, currencyCode: string): string => {
  const currency = getCurrencyByCode(currencyCode);
  const symbol = currency?.symbol || currencyCode;
  
  // Format number with thousands separator
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  // Position symbol based on currency conventions
  if (currencyCode === 'EUR') {
    return `€${formattedAmount}`;
  } else if (currencyCode === 'GBP') {
    return `£${formattedAmount}`;
  } else if (currencyCode === 'USD') {
    return `$${formattedAmount}`;
  } else if (currencyCode === 'ZAR') {
    return `R ${formattedAmount}`;
  } else {
    return `${currencyCode} ${formattedAmount}`;
  }
};

// Export currencies array for dropdown usage
export const currencies = currencyConfig.currencies;
export const defaultCurrency = currencyConfig.defaultCurrency;
