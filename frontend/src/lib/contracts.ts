// Arc Network Configuration
export const ARC_CONFIG = {
  testnet: {
    chainId: 5042002,
    name: 'Arc Testnet',
    rpcUrl: 'https://rpc.testnet.arc.network',
    blockExplorerUrl: 'https://testnet.arcscan.app',
    // Using environment variable or demo address (checksummed)
    contractAddress: (process.env.NEXT_PUBLIC_ARC_CONTRACT_ADDRESS || '0x072326C6a2194FE42Ed29Bc789F044934277E173').toLowerCase(),
    nativeCurrency: {
      name: 'Arc',
      symbol: 'ARC',
      decimals: 18,
    },
  },
  mainnet: {
    chainId: 5042003,
    name: 'Arc Mainnet',
    rpcUrl: 'https://rpc.arc.network',
    blockExplorerUrl: 'https://arcscan.app',
    contractAddress: (process.env.NEXT_PUBLIC_ARC_CONTRACT_ADDRESS_MAINNET || '0x0000000000000000000000000000000000000000').toLowerCase(),
    nativeCurrency: {
      name: 'Arc',
      symbol: 'ARC',
      decimals: 18,
    },
  },
};

// Supported Tokens on Arc Testnet
export const SUPPORTED_TOKENS = [
  {
    name: 'USD Coin',
    symbol: 'USDC',
    address: (process.env.NEXT_PUBLIC_ARC_USDC_ADDRESS || '0x3600000000000000000000000000000000000000').toLowerCase(),
    decimals: 6,
    icon: '💵',
  },
  {
    name: 'Circle USDC',
    symbol: 'USDC.e',
    address: (process.env.NEXT_PUBLIC_ARC_USDCE_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b1566469cb3').toLowerCase(),
    decimals: 6,
    icon: '⭕',
  },
];

// Payment Status Enum (must match contract)
export enum PaymentStatus {
  Pending = 0,
  Processing = 1,
  Settled = 2,
  Completed = 3,
  Failed = 4,
  Cancelled = 5,
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.Pending]: 'Pending',
  [PaymentStatus.Processing]: 'Processing',
  [PaymentStatus.Settled]: 'Settled',
  [PaymentStatus.Completed]: 'Completed',
  [PaymentStatus.Failed]: 'Failed',
  [PaymentStatus.Cancelled]: 'Cancelled',
};

// Gas limits for transactions
export const GAS_LIMITS = {
  initiatePayment: 300000n,
  completePayment: 100000n,
  approve: 50000n,
};

// Cross-Border Payments Contract ABI (simplified for key functions)
export const CROSS_BORDER_PAYMENTS_ABI = [
  {
    inputs: [
      { internalType: 'address', name: '_recipient', type: 'address' },
      { internalType: 'address', name: '_token', type: 'address' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
      { internalType: 'string', name: '_recipientCountry', type: 'string' },
      { internalType: 'string', name: '_senderCountry', type: 'string' },
      { internalType: 'string', name: '_paymentMethod', type: 'string' },
    ],
    name: 'initiatePayment',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_paymentId', type: 'uint256' }],
    name: 'completePayment',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_paymentId', type: 'uint256' }],
    name: 'cancelPayment',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_paymentId', type: 'uint256' }],
    name: 'getPayment',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'address', name: 'sender', type: 'address' },
          { internalType: 'address', name: 'recipient', type: 'address' },
          { internalType: 'address', name: 'token', type: 'address' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
          { internalType: 'uint256', name: 'feeAmount', type: 'uint256' },
          { internalType: 'string', name: 'recipientCountry', type: 'string' },
          { internalType: 'string', name: 'senderCountry', type: 'string' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
          { internalType: 'uint8', name: 'status', type: 'uint8' },
          { internalType: 'string', name: 'paymentMethod', type: 'string' },
        ],
        internalType: 'struct CrossBorderPayments.Payment',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_user', type: 'address' }],
    name: 'getUserPayments',
    outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
];

// ERC20 ABI (for token approval and transfers)
export const ERC20_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
];
