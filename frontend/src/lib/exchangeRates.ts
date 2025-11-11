// Exchange rates and currency conversion utilities

export interface ExchangeRate {
  pair: string; // e.g., "USD/PHP", "USD/INR"
  rate: number;
  lastUpdated: Date;
}

// Mock exchange rates (in production, fetch from API like Coingecko, CoinMarketCap, or Fixer.io)
export const EXCHANGE_RATES: Record<string, number> = {
  'USD/PHP': 56.5,
  'USD/INR': 83.12,
  'USD/NGN': 1550.0,
  'USD/KES': 130.5,
  'USD/MXN': 17.2,
  'USD/BRL': 4.97,
  'USD/ARS': 1045.0,
  'USD/SGD': 1.34,
  'USD/AED': 3.67,
  'USD/GBP': 0.79,
  'USD/EUR': 0.92,
};

// Country to currency mapping
export const COUNTRY_CURRENCY: Record<string, string> = {
  'PH': 'PHP',
  'IN': 'INR',
  'NG': 'NGN',
  'KE': 'KES',
  'MX': 'MXN',
  'BR': 'BRL',
  'AR': 'ARS',
  'SG': 'SGD',
  'AE': 'AED',
  'GB': 'GBP',
  'EU': 'EUR',
};

/**
 * Convert amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (fromCurrency === toCurrency) return amount;

  // For simplicity, convert through USD
  let amountInUSD = amount;

  // Convert from source currency to USD
  if (fromCurrency !== 'USD') {
    const rate = EXCHANGE_RATES[`USD/${fromCurrency}`];
    if (!rate) {
      throw new Error(`No exchange rate found for USD/${fromCurrency}`);
    }
    amountInUSD = amount / rate;
  }

  // Convert from USD to target currency
  if (toCurrency !== 'USD') {
    const rate = EXCHANGE_RATES[`USD/${toCurrency}`];
    if (!rate) {
      throw new Error(`No exchange rate found for USD/${toCurrency}`);
    }
    return amountInUSD * rate;
  }

  return amountInUSD;
}

/**
 * Get exchange rate between two currencies
 */
export function getExchangeRate(fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return 1;

  const rate1 = EXCHANGE_RATES[`USD/${fromCurrency}`] || 1;
  const rate2 = EXCHANGE_RATES[`USD/${toCurrency}`] || 1;

  return rate2 / rate1;
}

/**
 * Format currency value for display
 */
export function formatCurrencyDisplay(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    'USD': '$',
    'PHP': '₱',
    'INR': '₹',
    'NGN': '₦',
    'KES': 'KSh',
    'MXN': '$',
    'BRL': 'R$',
    'ARS': '$',
    'SGD': 'S$',
    'AED': 'د.إ',
    'GBP': '£',
    'EUR': '€',
  };

  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toFixed(2)}`;
}

/**
 * Calculate fees based on amount and method
 */
export function calculateFee(
  amount: number,
  method: 'crypto' | 'bank' | 'cash'
): { fee: number; feePercent: number; total: number } {
  // Crypto: 0.5% fee
  // Bank: 1% fee
  // Cash: 2% fee
  const feePercents = {
    crypto: 0.5,
    bank: 1.0,
    cash: 2.0,
  };

  const feePercent = feePercents[method];
  const fee = (amount * feePercent) / 100;
  const total = amount + fee;

  return { fee, feePercent, total };
}

/**
 * Fetch live exchange rates from API
 * In production, call Coingecko, Fixer.io, or similar
 */
export async function fetchLiveExchangeRates(): Promise<Record<string, number>> {
  try {
    // Example: Using exchange rate API
    // In production, use actual API
    // const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=usdc&vs_currencies=php,inr,ngn,kes,mxn,brl,ars,sgd,aed,gbp,eur');
    // return response.json();

    // For now, return mock rates
    return EXCHANGE_RATES;
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    return EXCHANGE_RATES; // Fallback to static rates
  }
}
