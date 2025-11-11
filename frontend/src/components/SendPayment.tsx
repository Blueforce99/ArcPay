'use client';

import React, { useState, useEffect } from 'react';
import { Send, Globe, DollarSign, User, AlertCircle, Wallet, LogOut } from 'lucide-react';
import { toast } from 'react-toastify';
import { useArcPayments } from '@/hooks/useArcPayments';
import { ethers } from 'ethers';
import { convertCurrency, calculateFee, formatCurrencyDisplay, EXCHANGE_RATES } from '@/lib/exchangeRates';

interface PaymentFormData {
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  recipientCountry: string;
  recipientAddress: string;
  recipientWallet: string;
  amount: string;
  currency: string;
  paymentMethod: 'crypto' | 'bank' | 'cash';
  purpose: string;
}

const COUNTRIES = [
  { code: 'PH', name: 'Philippines', currency: 'PHP' },
  { code: 'IN', name: 'India', currency: 'INR' },
  { code: 'NG', name: 'Nigeria', currency: 'NGN' },
  { code: 'KE', name: 'Kenya', currency: 'KES' },
  { code: 'MX', name: 'Mexico', currency: 'MXN' },
  { code: 'BR', name: 'Brazil', currency: 'BRL' },
  { code: 'AR', name: 'Argentina', currency: 'ARS' },
  { code: 'SG', name: 'Singapore', currency: 'SGD' },
  { code: 'AE', name: 'UAE', currency: 'AED' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
  { code: 'EU', name: 'Europe', currency: 'EUR' },
];

const PAYMENT_METHODS = [
  { id: 'crypto', label: 'Crypto Wallet', icon: '₿', description: 'Direct blockchain transfer' },
  { id: 'bank', label: 'Bank Transfer', icon: '🏦', description: 'Traditional banking' },
  { id: 'cash', label: 'Cash Pickup', icon: '💵', description: 'Local partner locations' },
];

const SAMPLE_DATA: PaymentFormData = {
  senderName: 'John Doe',
  senderEmail: 'john.doe@example.com',
  senderPhone: '+1 (555) 123-4567',
  recipientName: 'Maria Santos',
  recipientEmail: 'maria.santos@example.com',
  recipientPhone: '+63 (917) 123-4567',
  recipientCountry: 'PH',
  recipientAddress: '123 Main Street, Manila, Philippines 1000',
  recipientWallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f42aE5',
  amount: '0.1',
  currency: 'PHP',
  paymentMethod: 'crypto',
  purpose: 'personal',
};

export default function SendPayment() {
  const [formData, setFormData] = useState<PaymentFormData>(SAMPLE_DATA);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [senderCountry, setSenderCountry] = useState('US');
  const [walletConnected, setWalletConnected] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [fees, setFees] = useState({ fee: 0, feePercent: 0, total: 0 });
  const [disconnecting, setDisconnecting] = useState(false);

  const { 
    connectWallet, 
    approveToken, 
    initiatePayment,
    userAddress,
    isConnected,
    loading: contractLoading
  } = useArcPayments({
    onPaymentInitiated: (paymentId) => {
      console.log('✅ Payment initiated with ID:', paymentId);
    },
  });

  // Update wallet connected state when userAddress changes
  useEffect(() => {
    if (userAddress) {
      console.log('✅ Wallet auto-connected! Address:', userAddress);
      setWalletConnected(true);
    }
  }, [userAddress]);

  // Update exchange rate and fees when amount or currency changes
  useEffect(() => {
    if (formData.amount && formData.currency !== 'USD') {
      try {
        const rate = EXCHANGE_RATES[`USD/${formData.currency}`] || 1;
        setExchangeRate(rate);
        
        const feesCalc = calculateFee(parseFloat(formData.amount), formData.paymentMethod);
        setFees(feesCalc);
      } catch (error) {
        console.error('Error calculating rates:', error);
      }
    }
  }, [formData.amount, formData.currency, formData.paymentMethod]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountry = COUNTRIES.find(c => c.code === e.target.value);
    if (selectedCountry) {
      setFormData(prev => ({
        ...prev,
        recipientCountry: selectedCountry.code,
        currency: selectedCountry.currency,
      }));
    }
  };

  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1) {
      if (!formData.senderName.trim()) {
        toast.error('Please enter your name');
        return false;
      }
      if (!formData.senderEmail.trim()) {
        toast.error('Please enter your email');
        return false;
      }
      if (!formData.senderPhone.trim()) {
        toast.error('Please enter your phone number');
        return false;
      }
      return true;
    }

    if (currentStep === 2) {
      if (!formData.recipientName.trim()) {
        toast.error('Please enter recipient name');
        return false;
      }
      if (!formData.recipientEmail.trim()) {
        toast.error('Please enter recipient email');
        return false;
      }
      if (!formData.recipientPhone.trim()) {
        toast.error('Please enter recipient phone');
        return false;
      }
      if (!formData.recipientAddress.trim()) {
        toast.error('Please enter recipient address');
        return false;
      }
      if (!ethers.isAddress(formData.recipientWallet)) {
        toast.error('Please enter a valid wallet address');
        return false;
      }
      return true;
    }

    if (currentStep === 3) {
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        toast.error('Please enter a valid amount');
        return false;
      }
      if (parseFloat(formData.amount) < 0.1) {
        toast.error('❌ Minimum payment is 0.1 USDC');
        return false;
      }
      if (!walletConnected) {
        toast.error('Please connect your wallet');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleConnectWallet = async () => {
    try {
      console.log('🔌 Opening wallet modal...');
      setLoading(true);
      await connectWallet();
      toast.success('✅ Wallet connection initiated!');
    } catch (err: any) {
      console.error('❌ Wallet connection error:', err);
      toast.error(`❌ ${err.message || 'Failed to connect wallet'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      setDisconnecting(true);
      console.log('🔌 Disconnecting wallet...');
      // Import and call disconnect
      const { disconnectFromWallet } = await import('@/lib/onboard');
      await disconnectFromWallet();
      setWalletConnected(false);
      toast.success('✅ Wallet disconnected!');
    } catch (err: any) {
      console.error('❌ Wallet disconnection error:', err);
      toast.error(`❌ Failed to disconnect wallet: ${err.message}`);
    } finally {
      setDisconnecting(false);
    }
  };

  const savePaymentToStorage = (paymentData: any) => {
    if (!userAddress) return;

    const key = `payments_${userAddress}`;
    const stored = localStorage.getItem(key);
    const payments = stored ? JSON.parse(stored) : [];
    payments.unshift(paymentData);
    localStorage.setItem(key, JSON.stringify(payments));

    // Also save recipient
    const recipientsKey = 'recipients';
    const storedRecipients = localStorage.getItem(recipientsKey);
    const recipients = storedRecipients ? JSON.parse(storedRecipients) : [];
    
    const existingIndex = recipients.findIndex((r: any) => r.address === formData.recipientWallet);
    if (existingIndex >= 0) {
      recipients[existingIndex].totalReceived = (recipients[existingIndex].totalReceived || 0) + parseFloat(formData.amount);
    } else {
      recipients.push({
        address: formData.recipientWallet,
        name: formData.recipientName,
        country: formData.recipientCountry,
        verified: false,
        totalReceived: parseFloat(formData.amount),
      });
    }
    localStorage.setItem(recipientsKey, JSON.stringify(recipients));
  };

  const updatePaymentStatus = (txHash: string, status: 'Completed' | 'Processing' | 'Failed') => {
    if (!userAddress) return;

    const key = `payments_${userAddress}`;
    const stored = localStorage.getItem(key);
    if (!stored) return;

    const payments = JSON.parse(stored);
    const paymentIndex = payments.findIndex((p: any) => p.txHash === txHash);
    
    if (paymentIndex >= 0) {
      payments[paymentIndex].status = status;
      localStorage.setItem(key, JSON.stringify(payments));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(3)) {
      return;
    }

    if (!walletConnected || !userAddress) {
      toast.error('❌ Please connect your wallet first');
      return;
    }

    setLoading(true);

    try {
      console.log('📤 STARTING PAYMENT FLOW');
      console.log('Form data:', formData);
      
      // Arc Testnet USDC (native USDC with ERC-20 interface)
      const USDC_ADDRESS = (process.env.NEXT_PUBLIC_ARC_USDC_ADDRESS || '0x3600000000000000000000000000000000000000').toLowerCase();
      const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_ARC_CONTRACT_ADDRESS || '0x072326C6a2194FE42Ed29Bc789F044934277E173').toLowerCase();
      
      console.log('🔧 CONFIG:', { USDC_ADDRESS, CONTRACT_ADDRESS });
      
      // Convert amount from local currency to USD, then to USDC if needed
      let usdcAmount = parseFloat(formData.amount);
      if (formData.currency !== 'USD') {
        // Convert from local currency to USD
        const exchangeKey = `USD/${formData.currency}`;
        const rate = EXCHANGE_RATES[exchangeKey] || 1;
        usdcAmount = parseFloat(formData.amount) / rate; // local to USD
        console.log(`💱 Conversion: ${formData.amount} ${formData.currency} = ${usdcAmount.toFixed(6)} USD`);
      }
      
      console.log('🔧 Final USDC Amount:', usdcAmount);
      
      // Step 1: Approve token
      console.log('1️⃣ APPROVING USDC TOKEN');
      toast.info('1️⃣ Approving USDC... (Check wallet)');
      
      const approvalReceipt = await approveToken(
        USDC_ADDRESS,
        CONTRACT_ADDRESS,
        usdcAmount.toFixed(6) // Convert to string with proper decimals
      );
      console.log('✅ APPROVAL DONE:', approvalReceipt);

      // Step 2: Initiate payment
      console.log('2️⃣ INITIATING PAYMENT ON ARC');
      toast.info('2️⃣ Processing payment... (Check wallet)');
      
      const paymentResult = await initiatePayment(
        formData.recipientWallet,
        USDC_ADDRESS,
        usdcAmount.toFixed(6), // Use converted USDC amount
        formData.recipientCountry,
        senderCountry,
        formData.paymentMethod
      );

      console.log('✅ PAYMENT RESULT:', paymentResult);
      
      // Save payment to storage
      const paymentData = {
        id: paymentResult.paymentId || `payment_${Date.now()}`,
        sender: userAddress,
        recipient: formData.recipientWallet,
        amount: formData.amount,
        currency: formData.currency,
        status: 'Completed',
        paymentMethod: formData.paymentMethod,
        senderName: formData.senderName,
        recipientName: formData.recipientName,
        recipientCountry: formData.recipientCountry,
        timestamp: new Date().toISOString(),
        txHash: paymentResult.txHash,
      };

      savePaymentToStorage(paymentData);
      toast.success(`✅ Payment submitted! Tx: ${paymentResult.txHash?.substring(0, 10)}...`);

      // Reset
      setFormData(SAMPLE_DATA);
      setStep(1);
      setWalletConnected(false);

    } catch (error: any) {
      console.error('❌ ERROR:', error);
      const errorMessage = error.message || 'Transaction failed';
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  s <= step
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-all ${
                    s < step ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Sender Info</span>
          <span>Recipient Info</span>
          <span>Payment Details</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <div className="card space-y-4 animate-fadeIn">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Your Information
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                name="senderName"
                value={formData.senderName}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="input-base"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="senderEmail"
                  value={formData.senderEmail}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  className="input-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="senderPhone"
                  value={formData.senderPhone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000"
                  className="input-base"
                />
              </div>
            </div>
            <button type="button" onClick={handleNext} className="w-full btn-primary">Continue</button>
          </div>
        )}

        {step === 2 && (
          <div className="card space-y-4 animate-fadeIn">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              Recipient Information
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Name</label>
              <input
                type="text"
                name="recipientName"
                value={formData.recipientName}
                onChange={handleInputChange}
                className="input-base"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="recipientEmail"
                  value={formData.recipientEmail}
                  onChange={handleInputChange}
                  className="input-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="recipientPhone"
                  value={formData.recipientPhone}
                  onChange={handleInputChange}
                  className="input-base"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <select
                value={formData.recipientCountry}
                onChange={handleCountryChange}
                className="input-base"
              >
                {COUNTRIES.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name} ({country.currency})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                name="recipientAddress"
                value={formData.recipientAddress}
                onChange={handleInputChange}
                rows={3}
                className="input-base resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
              <input
                type="text"
                name="recipientWallet"
                value={formData.recipientWallet}
                onChange={handleInputChange}
                placeholder="0x..."
                className="input-base font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Blockchain wallet (0x...)</p>
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={handlePrevious} className="flex-1 btn-secondary">Back</button>
              <button type="button" onClick={handleNext} className="flex-1 btn-primary">Continue</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card space-y-6 animate-fadeIn">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Payment Details
            </h3>

            <div className={`p-4 rounded-lg border-2 ${walletConnected ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className={`w-5 h-5 ${walletConnected ? 'text-green-600' : 'text-yellow-600'}`} />
                    <span className={`font-semibold ${walletConnected ? 'text-green-900' : 'text-yellow-900'}`}>
                      {walletConnected ? '✅ Wallet Connected' : '❌ Wallet Not Connected'}
                    </span>
                  </div>
                  {walletConnected && userAddress && (
                    <p className="text-xs text-gray-600 font-mono break-all pl-7">{userAddress}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {!walletConnected && (
                    <button
                      type="button"
                      onClick={handleConnectWallet}
                      disabled={loading || contractLoading}
                      className="px-4 py-2 rounded-lg font-medium transition-all bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Connecting...' : 'Connect Wallet'}
                    </button>
                  )}
                  {walletConnected && (
                    <button
                      type="button"
                      onClick={handleDisconnectWallet}
                      disabled={disconnecting}
                      className="px-4 py-2 rounded-lg font-medium transition-all bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount ({formData.currency})</label>
              <div className="relative">
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="input-base pl-8"
                />
                <span className="absolute left-3 top-3 text-gray-600 font-semibold">
                  {formData.currency === 'PHP' ? '₱' : '$'}
                </span>
              </div>
            </div>

            {/* Exchange Rate Info */}
            {formData.amount && (
              <div className="grid grid-cols-2 gap-4 text-sm bg-blue-50 border border-blue-200 rounded p-4">
                <div>
                  <p className="text-blue-600">Exchange Rate</p>
                  <p className="font-semibold">1 USD = {exchangeRate.toFixed(2)} {formData.currency}</p>
                </div>
                <div>
                  <p className="text-blue-600">Network Fee</p>
                  <p className="font-semibold">{fees.feePercent}% (≈ {fees.fee.toFixed(2)})</p>
                </div>
                <div>
                  <p className="text-blue-600">Amount + Fee</p>
                  <p className="font-semibold text-lg text-blue-700">{formatCurrencyDisplay(fees.total, formData.currency)}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
              <div className="grid grid-cols-3 gap-3">
                {PAYMENT_METHODS.map(method => (
                  <label key={method.id} className={`flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.paymentMethod === method.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={formData.paymentMethod === method.id}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <span className="text-2xl mb-2">{method.icon}</span>
                    <span className="text-sm font-semibold text-gray-900">{method.label}</span>
                    <span className="text-xs text-gray-600">{method.description}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-gray-900">Transfer Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">From:</span><span className="font-medium">{formData.senderName}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">To:</span><span className="font-medium">{formData.recipientName}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Amount:</span><span className="font-medium text-blue-600">{formData.amount} {formData.currency}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Total Fee:</span><span className="font-medium text-orange-600">{fees.feePercent}%</span></div>
              </div>
            </div>

            <div className="flex gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">You will be asked to sign 2 transactions in your wallet.</p>
            </div>

            <div className="flex gap-4">
              <button type="button" onClick={handlePrevious} className="flex-1 btn-secondary">Back</button>
              <button
                type="submit"
                disabled={loading || !walletConnected}
                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Processing...' : 'Send Payment'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
