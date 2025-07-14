// Simple currency conversion utility
// In a real application, you would use a live currency API like exchangerate-api.io

const EXCHANGE_RATES = {
  // Base currency is USD
  USD: 1,
  NGN: 1430, // 1 USD = 1430 NGN (approximately)
  EUR: 0.92, // 1 USD = 0.92 EUR (approximately)
  GBP: 0.79, // 1 USD = 0.79 GBP (approximately)
};

export type Currency = 'NGN' | 'USD' | 'EUR' | 'GBP';

export const currencySymbols = {
  NGN: '₦',
  USD: '$',
  EUR: '€',
  GBP: '£'
};

/**
 * Convert amount from USD to target currency
 * @param amount Amount in USD
 * @param targetCurrency Target currency
 * @returns Converted amount
 */
export const convertFromUSD = (amount: number, targetCurrency: Currency): number => {
  if (targetCurrency === 'USD') return amount;
  
  const rate = EXCHANGE_RATES[targetCurrency];
  return Number((amount * rate).toFixed(2));
};

/**
 * Convert amount from NGN to target currency (legacy function, now goes through USD)
 * @param amount Amount in NGN
 * @param targetCurrency Target currency
 * @returns Converted amount
 */
export const convertFromNGN = (amount: number, targetCurrency: Currency): number => {
  if (targetCurrency === 'NGN') return amount;
  
  // Convert NGN to USD first, then to target currency
  const usdAmount = amount / EXCHANGE_RATES.NGN;
  return convertFromUSD(usdAmount, targetCurrency);
};

/**
 * Convert amount from any currency to USD
 * @param amount Amount in source currency
 * @param sourceCurrency Source currency
 * @returns Amount in USD
 */
export const convertToUSD = (amount: number, sourceCurrency: Currency): number => {
  if (sourceCurrency === 'USD') return amount;
  
  const rate = EXCHANGE_RATES[sourceCurrency];
  return Number((amount / rate).toFixed(2));
};

/**
 * Convert amount from any currency to NGN
 * @param amount Amount in source currency
 * @param sourceCurrency Source currency
 * @returns Amount in NGN
 */
export const convertToNGN = (amount: number, sourceCurrency: Currency): number => {
  if (sourceCurrency === 'NGN') return amount;
  
  // Convert to USD first, then to NGN
  const usdAmount = convertToUSD(amount, sourceCurrency);
  return convertFromUSD(usdAmount, 'NGN');
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
  
  // Convert to USD first, then to target currency
  const usdAmount = convertToUSD(amount, fromCurrency);
  return convertFromUSD(usdAmount, toCurrency);
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