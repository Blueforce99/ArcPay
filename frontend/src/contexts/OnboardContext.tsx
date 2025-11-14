'use client';

import React, { createContext, useContext, ReactNode, useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { getOnboard, switchToArcNetwork } from '@/lib/onboard';
import { toast } from 'react-toastify';

interface OnboardContextType {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  provider: ethers.BrowserProvider | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  loading: boolean;
  error: string | null;
  isOnCorrectChain: boolean;
}

const OnboardContext = createContext<OnboardContextType | undefined>(undefined);

const ARC_CHAIN_ID = 5042002; // Arc Testnet

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
  const isOnCorrectChain = chainId === ARC_CHAIN_ID;

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
          toast.success('✅ Connected to Arc Testnet!');
        } catch (networkErr: any) {
          console.error('❌ OnboardProvider: Network switch error:', networkErr.message);
          
          // Show user-friendly error message
          toast.error(
            '⚠️ Please manually switch to Arc Testnet (Chain ID: 5042002) in your wallet to proceed with transactions.'
          );
          
          setError('Network switch failed. Please manually switch to Arc Testnet in your wallet.');
        }
      }
    } catch (err: any) {
      const message = err.message || 'Failed to connect wallet';
      console.error('❌ OnboardProvider: Connection error:', err);
      setError(message);
      toast.error('❌ ' + message);
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

      const state = onboard.state.get();
      const wallets = state.wallets;
      
      if (wallets && wallets.length > 0) {
        const currentWallet = wallets[0];
        
        await onboard.disconnectWallet({ label: currentWallet.label });
        console.log('✅ OnboardProvider: Wallet disconnected from onboard');
        
        if (currentWallet.provider) {
          try {
            if (currentWallet.provider.disconnect) {
              await currentWallet.provider.disconnect();
            }
            
            if (currentWallet.provider.emit) {
              currentWallet.provider.emit('disconnect');
            }
          } catch (err: any) {
            console.warn('⚠️ OnboardProvider: Provider disconnect warning:', err.message);
          }
        }
        
        setWallet(null);
        setProvider(null);
      } else {
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
    isOnCorrectChain,
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
