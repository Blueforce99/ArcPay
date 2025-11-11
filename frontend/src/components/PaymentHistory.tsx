'use client';

import React, { useState } from 'react';
import { CheckCircle, Clock, XCircle, ArrowRight, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { useOnboardContext } from '@/contexts/OnboardContext';
import { usePaymentHistory } from '@/hooks/usePaymentHistory';

export default function PaymentHistory() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [refreshing, setRefreshing] = useState(false);
  
  const { address: userAddress } = useOnboardContext();
  const { payments, loading, error, refetch, source } = usePaymentHistory();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      toast.success('✅ Payment history refreshed');
    } catch (err) {
      toast.error('❌ Failed to refresh');
    } finally {
      setRefreshing(false);
    }
  };

  const filteredPayments = payments.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'pending') return p.status === 'Pending' || p.status === 'Processing';
    if (filter === 'completed') return p.status === 'Completed' || p.status === 'Settled';
    if (filter === 'failed') return p.status === 'Failed' || p.status === 'Cancelled';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Settled':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Pending':
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Failed':
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Settled':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Pending':
      case 'Processing':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'Failed':
      case 'Cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.info('Copied to clipboard');
  };

  if (!userAddress) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">Connect your wallet to view payment history</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-12 bg-red-50 border-2 border-red-200">
        <p className="text-red-600 mb-4">❌ Error loading payments: {error}</p>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          {refreshing ? 'Retrying...' : 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Payment History</h2>
        <button
          onClick={handleRefresh}
          disabled={loading || refreshing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {(['all', 'pending', 'completed', 'failed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-3 font-medium transition-all capitalize whitespace-nowrap ${
              filter === f
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {f}
            {f === 'all' && ` (${payments.length})`}
            {f === 'pending' && ` (${payments.filter(p => p.status === 'Pending' || p.status === 'Processing').length})`}
            {f === 'completed' && ` (${payments.filter(p => p.status === 'Completed' || p.status === 'Settled').length})`}
            {f === 'failed' && ` (${payments.filter(p => p.status === 'Failed' || p.status === 'Cancelled').length})`}
          </button>
        ))}
      </div>

      {/* Payments List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payments from blockchain...</p>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">
            {payments.length === 0 ? 'No payments found' : 'No payments match the selected filter'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map(payment => (
            <div key={payment.id} className="card space-y-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="font-semibold text-gray-900 truncate">{payment.sender.slice(0, 6)}...</div>
                      <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="font-semibold text-gray-900 truncate">{payment.recipient.slice(0, 6)}...</div>
                    </div>
                    <div className={`badge border ${getStatusColor(payment.status)} flex items-center gap-2 flex-shrink-0`}>
                      {getStatusIcon(payment.status)}
                      <span className="capitalize text-sm">{payment.status}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-600">Amount</p>
                      <p className="font-semibold text-lg text-blue-600">
                        {parseFloat(payment.amount).toFixed(2)} USDC
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Destination</p>
                      <p className="font-semibold">{payment.recipientCountry}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Method</p>
                      <p className="font-semibold capitalize">{payment.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Date</p>
                      <p className="font-semibold">{payment.timestamp.toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Fee Info */}
                  <div className="text-sm text-gray-600 mb-4">
                    <p>Fee: <span className="font-semibold text-orange-600">{parseFloat(payment.feeAmount).toFixed(4)} USDC</span></p>
                  </div>

                  {/* Transaction Details */}
                  <div className="pt-4 border-t border-gray-200 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">Payment ID:</span>
                      <code className="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded text-xs">{payment.id}</code>
                      <button
                        onClick={() => copyToClipboard(payment.id)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Copy Payment ID"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">Sender:</span>
                      <code className="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded text-xs truncate">
                        {payment.sender}
                      </code>
                      <button
                        onClick={() => copyToClipboard(payment.sender)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Copy Sender Address"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">Recipient:</span>
                      <code className="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded text-xs truncate">
                        {payment.recipient}
                      </code>
                      <button
                        onClick={() => copyToClipboard(payment.recipient)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Copy Recipient Address"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">Token:</span>
                      <code className="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded text-xs truncate">
                        {payment.token}
                      </code>
                      <a
                        href={`https://testnet.arcscan.app/token/${payment.token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                        title="View on Block Explorer"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className={`border rounded-lg p-4 text-sm ${
        source === 'blockchain'
          ? 'bg-blue-50 border-blue-200 text-blue-800'
          : 'bg-yellow-50 border-yellow-200 text-yellow-800'
      }`}>
        <p className="font-semibold mb-2">
          {source === 'blockchain' ? '🔗 Blockchain Data' : '💾 Local Data (Fallback)'}
        </p>
        <p>
          {source === 'blockchain'
            ? 'Payment history is fetched directly from the Arc testnet blockchain. All data is immutable and verifiable on-chain.'
            : 'Blockchain data could not be loaded. Showing data saved locally on this device.'}
        </p>
      </div>
    </div>
  );
}
