'use client';

import React, { createContext, useContext, ReactNode, useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { getOnboard, switchToArcNetwork } from '@/lib/onboard';

interface OnboardContextType {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  provider: ethers.BrowserProvider | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const OnboardContext = createContext<OnboardContextType | undefined>(undefined);

export function OnboardProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<any>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [onboardReady, setOnboardReady] = useState(false);

  // Only run on client side
  useEffect(() => {
    setMounted(true);
    
    // Cleanup on page visibility change - if user returns after switching wallets
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('📋 Page became visible - checking wallet state');
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Initialize onboard and subscribe to wallet state changes
  useEffect(() => {
    if (!mounted) return;

    try {
      console.log('🔧 OnboardProvider: Initializing onboard subscription');
      const onboard = getOnboard();
      
      if (!onboard) {
        console.error('❌ OnboardProvider: Failed to get onboard instance');
        return;
      }

      setOnboardReady(true);

      // Subscribe to wallet state changes
      const { unsubscribe } = onboard.state.select('wallets').subscribe((wallets: any[]) => {
        console.log('📡 OnboardProvider: Wallet state changed:', wallets.length > 0 ? wallets[0].label : 'no wallet');
        console.log('📋 Wallet details:', wallets.length > 0 ? { label: wallets[0].label, accounts: wallets[0].accounts?.length } : 'none');
        
        if (wallets.length > 0) {
          const currentWallet = wallets[0];
          setWallet(currentWallet);

          // Initialize provider
          if (currentWallet.provider) {
            try {
              const ethersProvider = new ethers.BrowserProvider(currentWallet.provider);
              setProvider(ethersProvider);
              setError(null);
              console.log('✅ OnboardProvider: Provider initialized for', currentWallet.label);
            } catch (err: any) {
              console.error('❌ OnboardProvider: Failed to initialize provider:', err);
              setError(err.message);
            }
          }
        } else {
          console.log('📭 OnboardProvider: No wallet connected');
          setWallet(null);
          setProvider(null);
        }
      });

      return () => {
        console.log('🧹 OnboardProvider: Cleaning up subscription');
        unsubscribe();
      };
    } catch (err) {
      console.error('❌ OnboardProvider: Failed to subscribe to wallet state:', err);
      setError('Failed to initialize wallet connection');
    }
  }, [mounted]);

  const address = wallet?.accounts[0]?.address || null;
  const chainId = wallet?.chains[0]?.id ? parseInt(wallet.chains[0].id, 16) : null;

  const connectWallet = useCallback(async () => {
    try {
      if (!onboardReady) {
        throw new Error('Onboard not yet initialized. Please wait...');
      }

      setLoading(true);
      setError(null);
      console.log('🔌 OnboardProvider: Connecting wallet...');
      
      const onboard = getOnboard();
      
      if (!onboard) {
        throw new Error('Onboard instance not available');
      }

      const wallets = await onboard.connectWallet();
      console.log('✅ OnboardProvider: Connected wallets:', wallets.length > 0 ? wallets[0].label : 'none');
      
      if (wallets.length > 0) {
        const currentWallet = wallets[0];
        setWallet(currentWallet);

        if (currentWallet.provider) {
          const ethersProvider = new ethers.BrowserProvider(currentWallet.provider);
          setProvider(ethersProvider);
        }

        // Step 2: Automatically switch to Arc network after wallet connection
        console.log('🔀 OnboardProvider: Switching to Arc network...');
        try {
          await switchToArcNetwork();
          console.log('✅ OnboardProvider: Network switched to Arc');
        } catch (networkErr: any) {
          console.warn('⚠️ OnboardProvider: Network switch warning:', networkErr.message);
          // Don't throw - wallet is connected even if network switch fails
          // User can manually switch network
        }
      }
    } catch (err: any) {
      const message = err.message || 'Failed to connect wallet';
      console.error('❌ OnboardProvider: Connection error:', err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onboardReady]);

  const disconnectWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔌 OnboardProvider: Disconnecting wallet...');
      
      const onboard = getOnboard();
      
      if (!onboard) {
        throw new Error('Onboard instance not available');
      }

      // Get current wallet state from onboard
      const state = onboard.state.get();
      const wallets = state.wallets;
      
      console.log('📋 Current wallet state from onboard:', wallets.length > 0 ? wallets[0].label : 'none');
      
      if (wallets && wallets.length > 0) {
        const currentWallet = wallets[0];
        console.log('📤 Calling onboard.disconnectWallet with label:', currentWallet.label);
        
        // Step 1: Disconnect from onboard
        await onboard.disconnectWallet({ label: currentWallet.label });
        console.log('✅ OnboardProvider: Wallet disconnected from onboard');
        
        // Step 2: Also manually disconnect the wallet provider to ensure wallet extension sees the disconnect
        if (currentWallet.provider) {
          try {
            console.log('🔌 OnboardProvider: Clearing wallet provider connection...');
            
            // For EIP-1193 providers (MetaMask, Rabby, OKX, etc.)
            if (currentWallet.provider.disconnect) {
              await currentWallet.provider.disconnect();
              console.log('✅ OnboardProvider: Provider disconnect() called');
            }
            
            // Also try to emit a disconnect event
            if (currentWallet.provider.emit) {
              currentWallet.provider.emit('disconnect');
              console.log('✅ OnboardProvider: Disconnect event emitted');
            }
          } catch (err: any) {
            console.warn('⚠️ OnboardProvider: Provider disconnect warning:', err.message);
            // Don't throw - this is just cleanup
          }
        }
        
        // Step 3: Clear local state
        setWallet(null);
        setProvider(null);
      } else {
        console.warn('⚠️ OnboardProvider: No wallet found in onboard state');
        // Still clear local state even if onboard has no wallet
        setWallet(null);
        setProvider(null);
      }
    } catch (err: any) {
      const message = err.message || 'Failed to disconnect wallet';
      console.error('❌ OnboardProvider: Disconnection error:', err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value: OnboardContextType = {
    isConnected: !!wallet,
    address: address?.toLowerCase() || null,
    chainId,
    provider,
    connectWallet,
    disconnectWallet,
    loading,
    error,
  };

  return (
    <OnboardContext.Provider value={value}>
      {children}
    </OnboardContext.Provider>
  );
}

export function useOnboardContext() {
  const context = useContext(OnboardContext);
  if (!context) {
    throw new Error('useOnboardContext must be used within OnboardProvider');
  }
  return context;
}
