'use client';

import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';
import coinbaseModule from '@web3-onboard/coinbase';
import ledgerModule from '@web3-onboard/ledger';
import keystoneModule from '@web3-onboard/keystone';

// Arc Testnet configuration
const ARC_CHAIN_ID = 5042002;
const ARC_CHAIN_ID_HEX = '0x4cef52';
const ARC_RPC_URL = 'https://rpc.testnet.arc.network';

console.log('🔗 Arc Network Config:', {
  chainId: ARC_CHAIN_ID,
  chainIdHex: ARC_CHAIN_ID_HEX,
  rpcUrl: ARC_RPC_URL,
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
    const chains = [
      {
        id: '0x1',
        token: 'ETH',
        label: 'Ethereum Mainnet',
        rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/demo',
        blockExplorerUrl: 'https://etherscan.io',
      },
      {
        id: '0xaa36a7',
        token: 'ETH',
        label: 'Sepolia Testnet',
        rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/demo',
        blockExplorerUrl: 'https://sepolia.etherscan.io',
      },
      {
        id: '0x89',
        token: 'MATIC',
        label: 'Polygon',
        rpcUrl: 'https://polygon-rpc.com',
        blockExplorerUrl: 'https://polygonscan.com',
      },
      {
        id: ARC_CHAIN_ID_HEX,
        token: 'ARC',
        label: 'Arc Testnet',
        rpcUrl: ARC_RPC_URL,
        blockExplorerUrl: 'https://testnet.arcscan.app',
      },
    ];

    const injected = injectedModule({
      displayUnavailable: true,
    });

    const wallets: any[] = [injected];

    const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

    if (WC_PROJECT_ID && WC_PROJECT_ID.length > 0) {
      try {
        const walletConnect = walletConnectModule({
          projectId: WC_PROJECT_ID,
          version: 2,
        });
        wallets.push(walletConnect);
      } catch (err: any) {
        console.warn('⚠️ WalletConnect init failed:', err.message);
      }
    }

    try {
      const coinbase = coinbaseModule();
      wallets.push(coinbase);
    } catch (err: any) {
      console.warn('⚠️ Coinbase init failed:', err.message);
    }

    try {
      const keystone = keystoneModule();
      wallets.push(keystone);
    } catch (err: any) {
      console.warn('⚠️ Keystone init failed:', err.message);
    }

    onboardInstance = Onboard({
      wallets,
      chains,
      appMetadata: {
        name: 'Arc Cross-Border Payments',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%236495ff"/><text x="50" y="60" font-size="60" text-anchor="middle" fill="white" font-weight="bold">⚡</text></svg>',
        description: 'Fast, secure, and transparent cross-border remittances using blockchain',
      },
      accountCenter: {
        desktop: { enabled: false },
        mobile: { enabled: false },
      },
      connect: {
        autoConnectLastWallet: false,
      },
      notify: {
        enabled: false,
      },
    });

    console.log('✅ web3-onboard initialized');
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

/**
 * Switch to Arc Testnet using the raw ethereum provider
 * This is the MOST RELIABLE method
 */
async function switchToArcViaProvider(provider: any): Promise<boolean> {
  try {
    console.log('🔀 [SWITCH] Attempting to switch to Arc Testnet...');
    
    // STEP 1: Try to switch directly
    try {
      console.log('📡 [SWITCH] Trying wallet_switchEthereumChain...');
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ARC_CHAIN_ID_HEX }],
      });
      console.log('✅ [SWITCH] Successfully switched!');
      return true;
    } catch (switchErr: any) {
      console.log('⚠️ [SWITCH] Switch failed:', switchErr.code, switchErr.message);
      
      // STEP 2: If error 4902 (chain not found), ADD the network first
      if (switchErr.code === 4902) {
        console.log('🔌 [SWITCH] Chain not found, adding Arc Testnet...');
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: ARC_CHAIN_ID_HEX,
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
          console.log('✅ [SWITCH] Arc Testnet added!');
          
          // STEP 3: Now try to switch
          console.log('🔀 [SWITCH] Retrying switch after adding...');
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: ARC_CHAIN_ID_HEX }],
          });
          console.log('✅ [SWITCH] Successfully switched after adding!');
          return true;
        } catch (addErr: any) {
          console.error('❌ [SWITCH] Failed to add network:', addErr.message);
          return false;
        }
      }
      
      return false;
    }
  } catch (err: any) {
    console.error('❌ [SWITCH] Fatal error:', err.message);
    return false;
  }
}

/**
 * Connect to wallet and FORCE switch to Arc Testnet
 */
export async function connectToWallet() {
  try {
    console.log('🔌 [CONNECT] Starting wallet connection...');
    const instance = getOnboard();
    
    if (!instance) {
      throw new Error('Onboard instance not available');
    }

    // STEP 1: Connect wallet
    console.log('📦 [CONNECT] Opening wallet selector...');
    const wallets = await instance.connectWallet();
    
    if (!wallets || wallets.length === 0) {
      throw new Error('No wallet selected');
    }
    
    const connectedWallet = wallets[0];
    console.log('✅ [CONNECT] Wallet connected:', connectedWallet.label);

    // STEP 2: Get the raw ethereum provider from the wallet
    const provider = connectedWallet.provider;
    if (!provider) {
      throw new Error('Provider not available from wallet');
    }

    // STEP 3: FORCE switch to Arc
    console.log('🔀 [CONNECT] Forcing Arc Testnet switch...');
    const switched = await switchToArcViaProvider(provider);
    
    if (switched) {
      console.log('✅ [CONNECT] COMPLETE: Connected and switched to Arc!');
    } else {
      console.warn('⚠️ [CONNECT] Network switch failed, but wallet is connected');
    }
    
    return connectedWallet;
  } catch (error) {
    console.error('❌ [CONNECT] Failed:', error);
    throw error;
  }
}

/**
 * Manually switch to Arc network
 */
export async function switchToArcNetwork() {
  try {
    console.log('🔀 [MANUAL_SWITCH] Manual switch requested');
    
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

    const provider = currentWallet.provider;
    if (!provider) {
      throw new Error('Provider not available');
    }

    const success = await switchToArcViaProvider(provider);
    
    if (!success) {
      throw new Error('Failed to switch to Arc Testnet');
    }

    console.log('✅ [MANUAL_SWITCH] Successfully switched');
    return true;
  } catch (err: any) {
    console.error('❌ [MANUAL_SWITCH] Error:', err.message);
    throw err;
  }
}

export async function disconnectFromWallet() {
  try {
    console.log('🔌 Disconnecting wallet');
    const instance = getOnboard();
    
    if (!instance) {
      throw new Error('Onboard instance not available');
    }

    const state = instance.state.get();
    const wallets = state.wallets;
    
    if (wallets.length > 0) {
      await instance.disconnectWallet({ label: wallets[0].label });
      console.log('✅ Wallet disconnected');
    }
  } catch (error) {
    console.error('❌ Disconnect failed:', error);
    throw error;
  }
}

export async function switchNetwork(chainId: string) {
  try {
    const instance = getOnboard();
    if (!instance) {
      throw new Error('Onboard instance not available');
    }
    await instance.setChain({ chainId });
  } catch (error) {
    console.error('❌ Chain switch failed:', error);
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
