'use client';

import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';
import coinbaseModule from '@web3-onboard/coinbase';
import ledgerModule from '@web3-onboard/ledger';
import keystoneModule from '@web3-onboard/keystone';

// Arc Testnet configuration - use environment variable or default
const ARC_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_ARC_CHAIN_ID || '5042002', 10);
const ARC_RPC_URL = process.env.NEXT_PUBLIC_ARC_RPC_URL || 'https://rpc.testnet.arc.network';
const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

const arcTestnet = {
  id: `0x${ARC_CHAIN_ID.toString(16)}`, // Convert to hex with 0x prefix
  token: 'USDC',
  label: 'Arc Testnet',
  rpcUrl: ARC_RPC_URL,
  blockExplorerUrl: 'https://testnet.arcscan.app',
};

console.log('🔗 Arc Network Config:', {
  chainId: ARC_CHAIN_ID,
  chainIdHex: arcTestnet.id,
  rpcUrl: ARC_RPC_URL,
  wcProjectId: WC_PROJECT_ID ? 'configured' : 'not configured (WalletConnect disabled)',
});

let onboardInstance: any = null;

function initializeOnboard() {
  if (typeof window === 'undefined') {
    console.warn('⚠️ Onboard initialization skipped (SSR context)');
    return null;
  }

  if (onboardInstance) {
    console.log('✅ Onboard already initialized');
    return onboardInstance;
  }

  try {
    // Initialize wallet modules
    const injected = injectedModule({
      displayUnavailable: true, // Show unavailable wallets grayed out
    });

    // WalletConnect is optional - only include if project ID is configured
    const wallets: any[] = [injected];

    if (WC_PROJECT_ID && WC_PROJECT_ID.length > 0) {
      try {
        const walletConnect = walletConnectModule({
          projectId: WC_PROJECT_ID,
          version: 2,
        });
        wallets.push(walletConnect);
        console.log('✅ WalletConnect enabled');
      } catch (err) {
        console.warn('⚠️ WalletConnect initialization failed:', err);
      }
    } else {
      console.warn('⚠️ WalletConnect disabled: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID not configured');
    }

    const coinbase = coinbaseModule();
    wallets.push(coinbase);

    // Ledger is optional - requires valid WalletConnect project ID
    if (WC_PROJECT_ID && WC_PROJECT_ID.length > 0) {
      try {
        const ledger = ledgerModule({
          projectId: WC_PROJECT_ID,
          walletConnectVersion: 2,
        });
        wallets.push(ledger);
        console.log('✅ Ledger enabled');
      } catch (err) {
        console.warn('⚠️ Ledger initialization failed:', err);
      }
    } else {
      console.warn('⚠️ Ledger disabled: requires WalletConnect project ID');
    }

    const keystone = keystoneModule();
    wallets.push(keystone);

    console.log('🔧 Initializing web3-onboard with wallet modules...');

    onboardInstance = Onboard({
      wallets,
      chains: [arcTestnet as any],
      appMetadata: {
        name: 'Arc Cross-Border Payments',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%236495ff"/><text x="50" y="60" font-size="60" text-anchor="middle" fill="white" font-weight="bold">⚡</text></svg>',
        description: 'Fast, secure, and transparent cross-border remittances using blockchain',
        recommendedInjectedWallets: [
          { name: 'MetaMask', url: 'https://metamask.io' },
          { name: 'Rabby Wallet', url: 'https://rabby.io' },
          { name: 'OKX Wallet', url: 'https://www.okx.com/web3' },
          { name: 'Trust Wallet', url: 'https://trustwallet.com' },
          { name: 'Brave Wallet', url: 'https://brave.com/wallet' },
          { name: 'Phantom', url: 'https://phantom.app' },
        ],
      },
      accountCenter: {
        desktop: {
          enabled: false,
        },
        mobile: {
          enabled: false,
        },
      },
      connect: {
        autoConnectLastWallet: true, // Remember last connected wallet
      },
      notify: {
        enabled: false, // Disable notifications for now
      },
    });

    console.log('✅ web3-onboard initialized successfully');
    
    // Clean up any stale wallet state on initialization
    cleanupStaleWallets();
    
    return onboardInstance;
  } catch (error) {
    console.error('❌ Failed to initialize onboard:', error);
    throw error;
  }
}

/**
 * Clean up stale wallet connections from previous browser sessions
 * This helps when switching between different wallet providers
 */
async function cleanupStaleWallets() {
  try {
    if (!onboardInstance) return;
    
    const state = onboardInstance.state.get();
    const wallets = state.wallets;
    
    if (wallets && wallets.length > 0) {
      console.log('🧹 Cleaning up stale wallets from previous session:', wallets.map((w: any) => w.label));
      
      for (const wallet of wallets) {
        try {
          await onboardInstance.disconnectWallet({ label: wallet.label });
          console.log('✅ Cleaned up wallet:', wallet.label);
        } catch (err: any) {
          console.warn('⚠️ Failed to cleanup wallet:', wallet.label, err.message);
        }
      }
    }
  } catch (err: any) {
    console.warn('⚠️ Cleanup error:', err.message);
  }
}

export function getOnboard() {
  if (!onboardInstance) {
    onboardInstance = initializeOnboard();
  }
  return onboardInstance;
}

/**
 * Reset the onboard instance and clean up state
 * Useful when switching between different wallet providers
 */
export async function resetOnboard() {
  try {
    console.log('🔄 Resetting onboard instance...');
    
    if (onboardInstance) {
      // Cleanup existing wallets
      await cleanupStaleWallets();
    }
    
    onboardInstance = null;
    console.log('✅ Onboard instance reset');
  } catch (err: any) {
    console.error('❌ Reset error:', err);
  }
}

/**
 * Switch to Arc testnet via wallet provider
 * This is more aggressive than onboard.setChain and works better with most wallets
 */
async function switchViaWalletProvider(provider: any): Promise<boolean> {
  try {
    console.log('📡 Attempting to switch network via wallet_switchEthereumChain...');
    
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: arcTestnet.id }],
    });
    
    console.log('✅ Switched to Arc network via wallet_switchEthereumChain');
    return true;
  } catch (switchErr: any) {
    // If the chain is not added, try to add it
    if (switchErr.code === 4902 || switchErr.message?.includes('Unrecognized chain ID')) {
      console.log('🔌 Chain not found, attempting to add Arc network...');
      
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: arcTestnet.id,
              chainName: 'Arc Testnet',
              rpcUrls: [ARC_RPC_URL],
              blockExplorerUrls: ['https://testnet.arcscan.app'],
              nativeCurrency: {
                name: 'USD Coin',
                symbol: 'USDC',
                decimals: 6,
              },
            },
          ],
        });
        
        console.log('✅ Arc network added and switched');
        return true;
      } catch (addErr: any) {
        console.error('❌ Failed to add Arc network:', addErr.message);
        return false;
      }
    } else {
      console.error('❌ Switch error:', switchErr.message);
      return false;
    }
  }
}

/**
 * Switch to Arc testnet
 */
export async function switchToArcNetwork() {
  try {
    console.log('🔀 Switching to Arc network...', { chainId: ARC_CHAIN_ID, hex: arcTestnet.id });
    
    const instance = getOnboard();
    if (!instance) {
      throw new Error('Onboard instance not available');
    }

    // First, try to get the wallet provider and switch directly
    const state = instance.state.get();
    const wallets = state.wallets;
    
    if (wallets && wallets.length > 0 && wallets[0].provider) {
      const success = await switchViaWalletProvider(wallets[0].provider);
      if (success) {
        return true;
      }
    }

    // Fallback: Try onboard's setChain method
    console.log('🔀 Fallback: Trying onboard.setChain()...');
    await instance.setChain({ chainId: arcTestnet.id });
    console.log('✅ Switched to Arc network via onboard');
    
    return true;
  } catch (err: any) {
    console.error('❌ Failed to switch network:', err.message);
    throw err;
  }
}

export const onboard = new Proxy({} as any, {
  get(target, prop) {
    const instance = getOnboard();
    if (!instance) {
      throw new Error('Onboard not initialized');
    }
    return (instance as any)[prop];
  },
});

export async function connectToWallet() {
  try {
    console.log('🔌 connectToWallet called');
    const instance = getOnboard();
    
    if (!instance) {
      throw new Error('Onboard instance not available');
    }

    console.log('📦 Calling instance.connectWallet()...');
    const wallets = await instance.connectWallet();
    
    console.log('✅ connectWallet result:', wallets);
    
    if (!wallets || wallets.length === 0) {
      throw new Error('No wallet connected');
    }
    
    return wallets[0];
  } catch (error) {
    console.error('❌ Failed to connect wallet:', error);
    throw error;
  }
}

export async function disconnectFromWallet() {
  try {
    console.log('🔌 disconnectFromWallet called');
    const instance = getOnboard();
    
    if (!instance) {
      throw new Error('Onboard instance not available');
    }

    const state = instance.state.get();
    const wallets = state.wallets;
    
    if (wallets.length > 0) {
      console.log('📡 Disconnecting wallet:', wallets[0].label);
      await instance.disconnectWallet({ label: wallets[0].label });
      console.log('✅ Wallet disconnected');
    }
  } catch (error) {
    console.error('❌ Failed to disconnect wallet:', error);
    throw error;
  }
}

export async function switchNetwork(chainId: string) {
  try {
    console.log('🔀 Switching to chain:', chainId);
    const instance = getOnboard();
    
    if (!instance) {
      throw new Error('Onboard instance not available');
    }

    await instance.setChain({ chainId });
    console.log('✅ Chain switched');
  } catch (error) {
    console.error('❌ Failed to switch network:', error);
    throw error;
  }
}
