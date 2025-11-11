// Country codes and information
export const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸', region: 'North America' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', region: 'North America' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', region: 'Asia' },
  { code: 'IN', name: 'India', flag: '🇮🇳', region: 'Asia' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', region: 'Africa' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', region: 'Africa' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', region: 'South America' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', region: 'South America' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', region: 'Europe' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', region: 'Europe' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', region: 'Asia' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', region: 'Middle East' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', region: 'North America' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', region: 'Oceania' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', region: 'Oceania' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', region: 'Asia' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', region: 'Asia' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', region: 'Asia' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', region: 'Asia' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', region: 'Asia' },
  { code: 'FR', name: 'France', flag: '🇫🇷', region: 'Europe' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', region: 'Europe' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', region: 'Europe' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', region: 'Europe' },
  { code: 'CN', name: 'China', flag: '🇨🇳', region: 'Asia' },
];

// Payment methods
export const PAYMENT_METHODS = [
  { id: 'wallet', name: 'Crypto Wallet', description: 'Direct to recipient wallet', icon: '💳' },
  { id: 'bank_transfer', name: 'Bank Transfer', description: 'Direct to bank account', icon: '🏦' },
  { id: 'cash_pickup', name: 'Cash Pickup', description: 'Pick up at partner location', icon: '💰' },
];

// Supported tokens - Arc Testnet (USDC only)
export const SUPPORTED_TOKENS = [
  { 
    symbol: 'USDC', 
    name: 'USD Coin', 
    decimals: 6, 
    icon: '💵',
    address: '0xA0D71B9877f44C744546D649147FfD63A7eE2D6D',
    description: 'Circle USDC on Arc'
  },
];

// Currency codes
export const CURRENCY_CODES: Record<string, string> = {
  US: 'USD',
  MX: 'MXN',
  PH: 'PHP',
  IN: 'INR',
  NG: 'NGN',
  KE: 'KES',
  BR: 'BRL',
  AR: 'ARS',
  GB: 'GBP',
  DE: 'EUR',
  SG: 'SGD',
  AE: 'AED',
  CA: 'CAD',
  AU: 'AUD',
  NZ: 'NZD',
  JP: 'JPY',
  KR: 'KRW',
  TH: 'THB',
  ID: 'IDR',
  VN: 'VND',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  RU: 'RUB',
  CN: 'CNY',
};

export function getCountryByCode(code: string) {
  return COUNTRIES.find(c => c.code === code);
}

export function getCurrencyByCountry(code: string) {
  return CURRENCY_CODES[code] || 'USD';
}

export function getTokenBySymbol(symbol: string) {
  return SUPPORTED_TOKENS.find(t => t.symbol === symbol);
}

export function getAllCountries() {
  return COUNTRIES;
}

export function getCountriesByRegion(region: string) {
  return COUNTRIES.filter(c => c.region === region);
}

export function getRegions() {
  return Array.from(new Set(COUNTRIES.map(c => c.region)));
}
