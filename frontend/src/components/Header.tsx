'use client';

import React, { useState } from 'react';
import { Globe, Menu, X, Wallet, LogOut } from 'lucide-react';
import { formatAddress } from '@/lib/utils';
import { toast } from 'react-toastify';

interface HeaderProps {
  onConnectChange?: () => Promise<void> | void;
  userAddress?: string | null;
  onDisconnect?: () => Promise<void> | void;
}

export default function Header({ onConnectChange, userAddress, onDisconnect }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const handleConnectWallet = async () => {
    setConnecting(true);
    try {
      console.log('🔘 Header: Connect clicked. Calling onConnectChange');
      if (onConnectChange) {
        await onConnectChange();
      }
      setMobileMenuOpen(false);
      console.log('✅ Header: Connected');
    } catch (error: any) {
      console.error('❌ Header Error:', error);
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      console.log('🔌 Header: Disconnect clicked');
      if (onDisconnect) {
        await onDisconnect();
      }
      setMobileMenuOpen(false);
      toast.info('Disconnected');
      console.log('✅ Header: Disconnected');
    } catch (error: any) {
      console.error('❌ Header Disconnect Error:', error);
      toast.error(error.message || 'Failed to disconnect');
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Globe className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Arc Pay</h1>
            <p className="text-xs text-gray-500">Cross-Border Payments</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-gray-600 hover:text-gray-900">
            Features
          </a>
          <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">
            How It Works
          </a>
          <a href="#faq" className="text-gray-600 hover:text-gray-900">
            FAQ
          </a>
        </nav>

        {/* Wallet Section */}
        <div className="flex items-center gap-4">
          {userAddress ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Connected</span>
              <span className="text-sm font-mono font-semibold text-gray-900">
                {formatAddress(userAddress)}
              </span>
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                {disconnecting ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectWallet}
              disabled={connecting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium disabled:opacity-50"
            >
              <Wallet className="w-4 h-4" />
              {connecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-600 hover:text-gray-900"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 p-4 space-y-2">
          <a href="#features" className="block text-gray-600 hover:text-gray-900 py-2">
            Features
          </a>
          <a href="#how-it-works" className="block text-gray-600 hover:text-gray-900 py-2">
            How It Works
          </a>
          <a href="#faq" className="block text-gray-600 hover:text-gray-900 py-2">
            FAQ
          </a>
        </div>
      )}
    </header>
  );
}
