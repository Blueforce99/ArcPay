import { createConfig, http } from 'wagmi';
import { metaMask, walletConnect } from 'wagmi/connectors';

// Arc Testnet Configuration
const arcTestnet = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
  },
  testnet: true,
} as const;

// Suppress MetaMask/wallet errors in development
if (typeof window !== 'undefined') {
  // Intercept chrome.runtime.sendMessage errors
  if (window.chrome && window.chrome.runtime) {
    const originalSendMessage = window.chrome.runtime.sendMessage;
    window.chrome.runtime.sendMessage = function(...args: any[]) {
      try {
        return originalSendMessage.apply(window.chrome.runtime, args);
      } catch (error: any) {
        if (error.message?.includes('Extension ID')) {
          return Promise.resolve(null);
        }
        throw error;
      }
    };
  }
}

export const config = createConfig({
  chains: [arcTestnet as any],
  connectors: [
    metaMask(),
    walletConnect({
      projectId: 'arc-cross-border-payments',
    }),
  ],
  transports: {
    [arcTestnet.id]: http('https://rpc.testnet.arc.network'),
  },
  ssr: true,
});
