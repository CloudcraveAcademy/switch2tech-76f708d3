// Simple currency conversion utility
// In a real application, you would use a live currency API like exchangerate-api.io

const EXCHANGE_RATES = {
  // Base rates (NGN to other currencies)
  NGN: 1,
  USD: 0.0007, // 1 NGN = 0.0007 USD (approximately)
  EUR: 0.0006, // 1 NGN = 0.0006 EUR (approximately)
  GBP: 0.0005, // 1 NGN = 0.0005 GBP (approximately)
};

export type Currency = 'NGN' | 'USD' | 'EUR' | 'GBP';

export const currencySymbols = {
  NGN: '₦',
  USD: '$',
  EUR: '€',
  GBP: '£'
};

/**
 * Convert amount from NGN to target currency
 * @param amount Amount in NGN
 * @param targetCurrency Target currency
 * @returns Converted amount
 */
export const convertFromNGN = (amount: number, targetCurrency: Currency): number => {
  if (targetCurrency === 'NGN') return amount;
  
  const rate = EXCHANGE_RATES[targetCurrency];
  return Number((amount * rate).toFixed(2));
};

/**
 * Convert amount from any currency to NGN
 * @param amount Amount in source currency
 * @param sourceCurrency Source currency
 * @returns Amount in NGN
 */
export const convertToNGN = (amount: number, sourceCurrency: Currency): number => {
  if (sourceCurrency === 'NGN') return amount;
  
  const rate = EXCHANGE_RATES[sourceCurrency];
  return Number((amount / rate).toFixed(2));
};

/**
 * Convert amount from one currency to another
 * @param amount Amount in source currency
 * @param fromCurrency Source currency
 * @param toCurrency Target currency
 * @returns Converted amount
 */
export const convertCurrency = (
  amount: number, 
  fromCurrency: Currency, 
  toCurrency: Currency
): number => {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to NGN first, then to target currency
  const ngnAmount = convertToNGN(amount, fromCurrency);
  return convertFromNGN(ngnAmount, toCurrency);
};

/**
 * Format currency with symbol and proper locale
 * @param amount Amount to format
 * @param currency Currency type
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: Currency): string => {
  const symbol = currencySymbols[currency];
  return `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Get current exchange rates (in a real app, this would fetch from an API)
 * @returns Exchange rates object
 */
export const getExchangeRates = (): Record<Currency, number> => {
  return { ...EXCHANGE_RATES };
};