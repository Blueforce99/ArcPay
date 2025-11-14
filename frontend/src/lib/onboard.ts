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
  id: `0x${ARC_CHAIN_ID.toString(16)}`, // Convert to hex with 0x prefix - should be 0x4cef52
  token: 'ARC',
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
    // Define supported chains - include common ones for wallet compatibility
    const chains = [
      // Ethereum Mainnet (for wallet compatibility)
      {
        id: '0x1',
        token: 'ETH',
        label: 'Ethereum Mainnet',
        rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/demo',
        blockExplorerUrl: 'https://etherscan.io',
      },
      // Sepolia Testnet (common test network)
      {
        id: '0xaa36a7',
        token: 'ETH',
        label: 'Sepolia Testnet',
        rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/demo',
        blockExplorerUrl: 'https://sepolia.etherscan.io',
      },
      // Polygon (for wallet compatibility)
      {
        id: '0x89',
        token: 'MATIC',
        label: 'Polygon',
        rpcUrl: 'https://polygon-rpc.com',
        blockExplorerUrl: 'https://polygonscan.com',
      },
      // Arc Testnet - MUST be in the chains list
      arcTestnet,
    ];

    // Initialize wallet modules
    const injected = injectedModule({
      displayUnavailable: true,
    });

    const wallets: any[] = [injected];

    // Add WalletConnect if configured
    if (WC_PROJECT_ID && WC_PROJECT_ID.length > 0) {
      try {
        console.log('📡 Initializing WalletConnect with project ID:', WC_PROJECT_ID);
        const walletConnect = walletConnectModule({
          projectId: WC_PROJECT_ID,
          version: 2,
          dappUrl: typeof window !== 'undefined' ? window.location.origin : 'https://arc-pay.vercel.app',
        });
        wallets.push(walletConnect);
        console.log('✅ WalletConnect module added');
      } catch (err: any) {
        console.warn('⚠️ WalletConnect initialization failed:', err.message);
      }
    } else {
      console.warn('⚠️ WalletConnect disabled: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID not configured');
    }

    // Add Coinbase
    try {
      const coinbase = coinbaseModule();
      wallets.push(coinbase);
      console.log('✅ Coinbase module added');
    } catch (err: any) {
      console.warn('⚠️ Coinbase initialization failed:', err.message);
    }

    // Add Ledger if WalletConnect is configured
    if (WC_PROJECT_ID && WC_PROJECT_ID.length > 0) {
      try {
        const ledger = ledgerModule({
          projectId: WC_PROJECT_ID,
          walletConnectVersion: 2,
        });
        wallets.push(ledger);
        console.log('✅ Ledger module added');
      } catch (err: any) {
        console.warn('⚠️ Ledger initialization failed:', err.message);
      }
    }

    // Add Keystone
    try {
      const keystone = keystoneModule();
      wallets.push(keystone);
      console.log('✅ Keystone module added');
    } catch (err: any) {
      console.warn('⚠️ Keystone initialization failed:', err.message);
    }

    console.log('🔧 Initializing web3-onboard with', wallets.length, 'wallet modules');

    onboardInstance = Onboard({
      wallets,
      chains,
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
        autoConnectLastWallet: false, // IMPORTANT: Disable auto-connect to force explicit switch
      },
      notify: {
        enabled: false,
      },
    });

    console.log('✅ web3-onboard initialized successfully with', wallets.length, 'modules');
    
    return onboardInstance;
  } catch (error) {
    console.error('❌ Failed to initialize onboard:', error);
    throw error;
  }
}

export function getOnboard() {
  if (!onboardInstance) {
    onboardInstance = initializeOnboard();
  }
  return onboardInstance;
}

export async function resetOnboard() {
  try {
    console.log('🔄 Resetting onboard instance...');
    
    if (onboardInstance) {
      const state = onboardInstance.state.get();
      const wallets = state.wallets;
      
      if (wallets && wallets.length > 0) {
        console.log('🧹 Disconnecting wallets...');
        for (const wallet of wallets) {
          try {
            await onboardInstance.disconnectWallet({ label: wallet.label });
          } catch (err: any) {
            console.warn('⚠️ Cleanup warning for', wallet.label, ':', err.message);
          }
        }
      }
    }
    
    onboardInstance = null;
    console.log('✅ Onboard instance reset');
  } catch (err: any) {
    console.error('❌ Reset error:', err);
  }
}

/**
 * Add Arc Testnet to wallet
 * CRITICAL: Correct native currency configuration
 */
async function addArcNetworkToWallet(provider: any): Promise<boolean> {
  try {
    console.log('🔌 [ADD_NETWORK] Attempting to add Arc Testnet to wallet...');
    console.log('📋 Network params:', {
      chainId: arcTestnet.id,
      chainName: 'Arc Testnet',
      rpcUrl: ARC_RPC_URL,
    });
    
    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: arcTestnet.id, // 0x4cef52
          chainName: 'Arc Testnet',
          rpcUrls: [ARC_RPC_URL],
          blockExplorerUrls: ['https://testnet.arcscan.app'],
          nativeCurrency: {
            name: 'Arc',
            symbol: 'ARC',
            decimals: 18,
          },
        },
      ],
    });
    
    console.log('✅ [ADD_NETWORK] Arc Testnet added to wallet');
    return true;
  } catch (err: any) {
    console.warn('⚠️ [ADD_NETWORK] Failed to add Arc Testnet:', err.code, err.message);
    // Don't throw - continue with switch even if add fails
    return false;
  }
}

/**
 * Switch wallet to Arc Testnet
 * Handles both cases: network exists OR needs to be added first
 */
async function switchToArcViaProvider(provider: any): Promise<boolean> {
  try {
    console.log('🔀 [SWITCH] Attempting to switch to Arc Testnet (', arcTestnet.id, ')');
    
    // Step 1: Try to switch directly
    try {
      console.log('📡 [SWITCH] Requesting wallet_switchEthereumChain...');
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: arcTestnet.id }],
      });
      
      console.log('✅ [SWITCH] Successfully switched to Arc Testnet');
      return true;
    } catch (switchErr: any) {
      console.warn('⚠️ [SWITCH] wallet_switchEthereumChain failed:', switchErr.code, switchErr.message);
      
      // Step 2: If chain not found (error code 4902), add it first
      if (switchErr.code === 4902 || switchErr.message?.includes('Unrecognized chain ID')) {
        console.log('🔌 [SWITCH] Chain not found (4902), adding Arc Testnet first...');
        
        const added = await addArcNetworkToWallet(provider);
        
        // Step 3: Try to switch again after adding
        console.log('🔀 [SWITCH] Retrying wallet_switchEthereumChain after adding network...');
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: arcTestnet.id }],
        });
        
        console.log('✅ [SWITCH] Successfully added and switched to Arc Testnet');
        return true;
      } else {
        console.error('❌ [SWITCH] Switch failed with unexpected error:', switchErr.message);
        throw switchErr;
      }
    }
  } catch (err: any) {
    console.error('❌ [SWITCH] Fatal error switching to Arc network:', err.message);
    return false;
  }
}

/**
 * Connect to wallet and immediately switch to Arc Testnet
 * This is the main entry point from the UI
 */
export async function connectToWallet() {
  try {
    console.log('🔌 [CONNECT] connectToWallet called');
    const instance = getOnboard();
    
    if (!instance) {
      throw new Error('Onboard instance not available');
    }

    // Step 1: Connect wallet
    console.log('📦 [CONNECT] Calling instance.connectWallet()...');
    const wallets = await instance.connectWallet();
    
    if (!wallets || wallets.length === 0) {
      throw new Error('No wallet connected');
    }
    
    console.log('✅ [CONNECT] Wallet connected:', wallets[0].label);
    const connectedWallet = wallets[0];

    // Step 2: IMMEDIATELY switch to Arc Testnet
    console.log('🔀 [CONNECT] Now switching to Arc Testnet...');
    if (!connectedWallet.provider) {
      throw new Error('Wallet provider not available');
    }

    const switched = await switchToArcViaProvider(connectedWallet.provider);
    
    if (switched) {
      console.log('✅ [CONNECT] COMPLETE: Wallet connected and switched to Arc Testnet');
      return connectedWallet;
    } else {
      console.warn('⚠️ [CONNECT] Wallet connected but network switch failed. Please manually switch to Arc Testnet in your wallet.');
      console.warn('   Network to add: Arc Testnet (Chain ID: 5042002 / 0x4cef52)');
      console.warn('   RPC URL: ' + ARC_RPC_URL);
      return connectedWallet;
    }
  } catch (error) {
    console.error('❌ [CONNECT] Failed to connect wallet:', error);
    throw error;
  }
}

/**
 * Explicitly switch to Arc network (can be called anytime)
 */
export async function switchToArcNetwork() {
  try {
    console.log('🔀 [MANUAL_SWITCH] Manual network switch requested');
    
    const instance = getOnboard();
    if (!instance) {
      throw new Error('Onboard instance not available');
    }

    const state = instance.state.get();
    const wallets = state.wallets;
    
    if (!wallets || wallets.length === 0) {
      throw new Error('No wallet connected');
    }

    const currentWallet = wallets[0];
    console.log('📱 [MANUAL_SWITCH] Current wallet:', currentWallet.label);

    if (!currentWallet.provider) {
      throw new Error('Wallet provider not available');
    }

    const success = await switchToArcViaProvider(currentWallet.provider);
    
    if (!success) {
      throw new Error('Failed to switch to Arc Testnet');
    }

    console.log('✅ [MANUAL_SWITCH] Successfully switched to Arc Testnet');
    return true;
  } catch (err: any) {
    console.error('❌ [MANUAL_SWITCH] Error:', err.message);
    throw err;
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

export const onboard = new Proxy({} as any, {
  get(target, prop) {
    const instance = getOnboard();
    if (!instance) {
      throw new Error('Onboard not initialized');
    }
    return (instance as any)[prop];
  },
});
