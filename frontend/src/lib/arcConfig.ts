// Arc Testnet Configuration
// Updated with correct Arc testnet details

export const ARC_TESTNET = {
  id: 5042002,
  name: 'Arc Testnet',
  network: 'arc-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Arc ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.arc.network'],
    },
    public: {
      http: ['https://rpc.testnet.arc.network'],
    },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
  },
  testnet: true,
};

export const ARC_MAINNET = {
  id: 5042002,
  name: 'Arc Network',
  network: 'arc-mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Arc ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.arc.network'],
    },
    public: {
      http: ['https://rpc.arc.network'],
    },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://arcscan.app' },
  },
  testnet: false,
};

// Contract configuration
// Update CONTRACT_ADDRESS after deployment
export const CONTRACT_CONFIG = {
  address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
  network: process.env.NEXT_PUBLIC_NETWORK || 'testnet',
  chainId: 5042002,
};

// Token configuration - USDC on Arc Testnet
// Reference: https://docs.arc.network/arc/references/contract-addresses
export const TOKENS = {
  USDC: {
    address: process.env.NEXT_PUBLIC_USDC_ADDRESS || '0xA0D71B9877f44C744546D649147FfD63A7eE2D6D',
    symbol: 'USDC',
    decimals: 6,
    name: 'USD Coin',
  },
};

export const getTokenBySymbol = (symbol: string) => {
  return TOKENS[symbol as keyof typeof TOKENS];
};

export const getSupportedTokens = () => {
  return Object.values(TOKENS);
};

// Circle Faucet
export const FAUCET_URL = 'https://faucet.circle.com';
