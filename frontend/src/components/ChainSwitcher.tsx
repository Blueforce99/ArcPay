'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useOnboardContext } from '@/contexts/OnboardContext';
import { switchToArcNetwork } from '@/lib/onboard';
import { toast } from 'react-toastify';

interface Chain {
  id: number;
  name: string;
  hex: string;
  symbol: string;
}

const SUPPORTED_CHAINS: Chain[] = [
  {
    id: 1,
    name: 'Ethereum Mainnet',
    hex: '0x1',
    symbol: 'ETH',
  },
  {
    id: 5042002,
    name: 'Arc Testnet',
    hex: '0x4cef52',
    symbol: 'ARC',
  },
  {
    id: 137,
    name: 'Polygon',
    hex: '0x89',
    symbol: 'MATIC',
  },
  {
    id: 11155111,
    name: 'Sepolia Testnet',
    hex: '0xaa36a7',
    symbol: 'ETH',
  },
];

export default function ChainSwitcher() {
  const { chainId, isConnected } = useOnboardContext();
  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find current chain
  const currentChain = SUPPORTED_CHAINS.find((c) => c.id === chainId) || {
    id: chainId || 0,
    name: `Unknown (${chainId})`,
    hex: chainId ? `0x${chainId.toString(16)}` : '0x0',
    symbol: '?',
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchChain = async (chain: Chain) => {
    try {
      setSwitching(true);
      setIsOpen(false);

      console.log(`🔀 Switching to ${chain.name}...`);

      if (chain.id === 5042002) {
        // Arc Testnet
        await switchToArcNetwork();
        toast.success(`✅ Switched to ${chain.name}`);
      } else {
        // For other chains, show a message
        toast.info(`⚠️ Please manually switch to ${chain.name} in your wallet`);
      }

      console.log(`✅ Switched to ${chain.name}`);
    } catch (error: any) {
      console.error(`❌ Failed to switch to ${chain.name}:`, error);
      toast.error(`Failed to switch to ${chain.name}`);
    } finally {
      setSwitching(false);
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Chain Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={switching}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        title={`Current network: ${currentChain.name}`}
      >
        {/* Chain Indicator Dot */}
        <div className={`w-2 h-2 rounded-full ${
          currentChain.id === 5042002
            ? 'bg-green-500'
            : currentChain.id === 1
            ? 'bg-purple-500'
            : currentChain.id === 137
            ? 'bg-blue-500'
            : 'bg-gray-400'
        }`} />

        {/* Chain Name */}
        <span className="text-sm font-medium text-gray-700">
          {currentChain.name}
        </span>

        {/* Chain Symbol */}
        <span className="text-xs text-gray-500">
          {currentChain.symbol}
        </span>

        {/* Dropdown Arrow */}
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
            <p className="text-xs font-semibold text-gray-600 uppercase">
              Select Network
            </p>
          </div>

          {/* Chain Options */}
          <div className="py-1">
            {SUPPORTED_CHAINS.map((chain) => {
              const isActive = chain.id === currentChain.id;
              return (
                <button
                  key={chain.id}
                  onClick={() => handleSwitchChain(chain)}
                  disabled={switching || isActive}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-900'
                      : 'text-gray-700 hover:bg-gray-50'
                  } disabled:opacity-50 ${switching ? 'cursor-wait' : 'hover:cursor-pointer'}`}
                >
                  {/* Status Indicator */}
                  <div
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      chain.id === 5042002
                        ? 'bg-green-500'
                        : chain.id === 1
                        ? 'bg-purple-500'
                        : chain.id === 137
                        ? 'bg-blue-500'
                        : 'bg-gray-400'
                    }`}
                  />

                  {/* Chain Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{chain.name}</div>
                    <div className="text-xs text-gray-500">
                      Chain ID: {chain.id}
                    </div>
                  </div>

                  {/* Active Badge */}
                  {isActive && (
                    <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      Active
                    </span>
                  )}

                  {/* Loading State */}
                  {switching && chain.id === currentChain.id && (
                    <span className="text-xs text-gray-500 animate-pulse">
                      Switching...
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-600">
              💡 Arc Testnet is recommended for cross-border payments
            </p>
          </div>
        </div>
      )}
    </div>
  );
}