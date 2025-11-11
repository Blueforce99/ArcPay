'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Send, Shield } from 'lucide-react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import SendPayment from '@/components/SendPayment';
import PaymentHistory from '@/components/PaymentHistory';
import AdminDashboard from '@/components/AdminDashboard';
import { useArcPayments } from '@/hooks/useArcPayments';
import { useOnboardContext } from '@/contexts/OnboardContext';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'send' | 'history' | 'admin'>('send');
  const [isAdmin, setIsAdmin] = useState(false);
  const [contextError, setContextError] = useState<string | null>(null);
  
  // Use the hooks
  let disconnectWallet: any = null;
  
  try {
    const onboardContext = useOnboardContext();
    disconnectWallet = onboardContext.disconnectWallet;
  } catch (err: any) {
    console.error('❌ Context Error:', err.message);
    setContextError(err.message);
  }

  const { userAddress, connectWallet, ...arcPayments } = useArcPayments();
  const isConnected = !!userAddress;

  console.log('🏠 Page rendered. userAddress:', userAddress, 'isConnected:', isConnected);

  // Handle connection from Header
  const handleConnect = async () => {
    try {
      console.log('🔗 Page: calling connectWallet from hook');
      await connectWallet();
      console.log('✅ Page: connected successfully');
    } catch (error) {
      console.error('❌ Page: connection failed', error);
    }
  };

  // Handle disconnection
  const handleDisconnect = async () => {
    try {
      console.log('🔌 Page: disconnecting');
      if (!disconnectWallet) {
        throw new Error('Disconnect function not available');
      }
      await disconnectWallet();
      console.log('✅ Page: disconnected successfully');
    } catch (error) {
      console.error('❌ Page: disconnect failed', error);
    }
  };

  const handleToggleAdmin = () => {
    const adminPassword = prompt('Enter admin password:');
    if (adminPassword === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || adminPassword === 'admin123') {
      setIsAdmin(!isAdmin);
    }
  };

  if (contextError) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Context Error</h1>
          <p className="text-gray-600">{contextError}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      {/* Header - pass handlers */}
      <Header 
        onConnectChange={handleConnect}
        userAddress={userAddress}
        onDisconnect={handleDisconnect}
      />

      {/* Hero Section for non-connected users */}
      {!isConnected && <HeroSection />}

      {/* Main Dashboard */}
      {isConnected && (
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Tab Navigation */}
          <div className="flex gap-4 border-b border-neutral-200 flex-wrap">
            <button
              onClick={() => setActiveTab('send')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                activeTab === 'send'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Send className="w-5 h-5" />
              Send Payment
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                activeTab === 'history'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              Payment History
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                  activeTab === 'admin'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Shield className="w-5 h-5" />
                Admin Dashboard
              </button>
            )}
            
            <button
              onClick={handleToggleAdmin}
              className="ml-auto px-4 py-4 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50"
            >
              {isAdmin ? 'Exit Admin' : 'Admin Mode'}
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-screen">
            {activeTab === 'send' && <SendPayment />}
            {activeTab === 'history' && <PaymentHistory />}
            {activeTab === 'admin' && isAdmin && <AdminDashboard />}
          </div>
        </div>
      )}
    </main>
  );
}
