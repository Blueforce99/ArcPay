/**
 * Wallet connection service
 * Handles connections to various wallet providers
 */

export interface WalletProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on?: (event: string, callback: (...args: any[]) => void) => void;
  removeListener?: (event: string, callback: (...args: any[]) => void) => void;
}

export class WalletService {
  private static getProvider(): WalletProvider | null {
    // Check if wallet provider exists
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      return null;
    }
    return ethereum;
  }

  static async connectWallet(): Promise<string[] | null> {
    const provider = this.getProvider();
    
    if (!provider) {
      throw new Error('No wallet provider found. Please install MetaMask or Rabby Wallet.');
    }

    try {
      // Request accounts - this should trigger wallet UI
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });

      if (!Array.isArray(accounts) || accounts.length === 0) {
        throw new Error('No accounts returned from wallet');
      }

      return accounts;
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('Connection rejected by user');
      } else if (error.code === -32002) {
        throw new Error('A connection request is already pending. Check your wallet extension.');
      }
      throw error;
    }
  }

  static async getAccounts(): Promise<string[]> {
    const provider = this.getProvider();
    
    if (!provider) {
      return [];
    }

    try {
      const accounts = await provider.request({
        method: 'eth_accounts',
      });
      return Array.isArray(accounts) ? accounts : [];
    } catch (error) {
      console.error('Failed to get accounts:', error);
      return [];
    }
  }

  static async switchNetwork(chainId: string): Promise<void> {
    const provider = this.getProvider();
    
    if (!provider) {
      throw new Error('No wallet provider found');
    }

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added, try to add it
        throw new Error('Please add Arc Testnet to your wallet');
      }
      throw error;
    }
  }

  static async getChainId(): Promise<string> {
    const provider = this.getProvider();
    
    if (!provider) {
      throw new Error('No wallet provider found');
    }

    try {
      return await provider.request({
        method: 'eth_chainId',
      });
    } catch (error) {
      throw new Error('Failed to get chain ID');
    }
  }

  static onAccountsChanged(callback: (accounts: string[]) => void): void {
    const provider = this.getProvider();
    if (provider?.on) {
      provider.on('accountsChanged', callback);
    }
  }

  static onChainChanged(callback: (chainId: string) => void): void {
    const provider = this.getProvider();
    if (provider?.on) {
      provider.on('chainChanged', callback);
    }
  }

  static removeAccountsChangedListener(callback: (accounts: string[]) => void): void {
    const provider = this.getProvider();
    if (provider?.removeListener) {
      provider.removeListener('accountsChanged', callback);
    }
  }

  static removeChainChangedListener(callback: (chainId: string) => void): void {
    const provider = this.getProvider();
    if (provider?.removeListener) {
      provider.removeListener('chainChanged', callback);
    }
  }
}
