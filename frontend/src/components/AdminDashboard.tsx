'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, Clock, AlertCircle, Shield, Users, Settings, TrendingUp } from 'lucide-react';
import { toast } from 'react-toastify';

interface Payment {
  id: string;
  sender: string;
  recipient: string;
  amount: string;
  currency: string;
  status: 'Pending' | 'Processing' | 'Settled' | 'Completed' | 'Failed' | 'Cancelled';
  paymentMethod: 'crypto' | 'bank' | 'cash';
  senderName: string;
  recipientName: string;
  timestamp: string;
}

interface Recipient {
  address: string;
  name: string;
  country: string;
  bankAccount?: string;
  bankCode?: string;
  verified: boolean;
  verifiedAt?: string;
  totalReceived: number;
}

interface AdminStats {
  totalPayments: number;
  pendingPayments: number;
  completedPayments: number;
  totalVolume: number;
  verifiedRecipients: number;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'recipients' | 'settings'>('overview');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalPayments: 0,
    pendingPayments: 0,
    completedPayments: 0,
    totalVolume: 0,
    verifiedRecipients: 0,
  });
  const [loading, setLoading] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [bankAccount, setBankAccount] = useState('');
  const [bankCode, setBankCode] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const allPayments: Payment[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('payments_')) {
          const stored = JSON.parse(localStorage.getItem(key) || '[]');
          allPayments.push(...stored);
        }
      }

      const storedRecipients = localStorage.getItem('recipients') || '[]';
      const allRecipients: Recipient[] = JSON.parse(storedRecipients);

      setPayments(allPayments);
      setRecipients(allRecipients);

      const stats: AdminStats = {
        totalPayments: allPayments.length,
        pendingPayments: allPayments.filter(p => p.status === 'Pending' || p.status === 'Processing').length,
        completedPayments: allPayments.filter(p => p.status === 'Completed' || p.status === 'Settled').length,
        totalVolume: allPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0),
        verifiedRecipients: allRecipients.filter(r => r.verified).length,
      };
      setStats(stats);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const completePayment = async (paymentId: string) => {
    try {
      const payment = payments.find(p => p.id === paymentId);
      if (!payment) return;

      const updated = { ...payment, status: 'Completed' as const };
      const updatedPayments = payments.map(p => p.id === paymentId ? updated : p);
      setPayments(updatedPayments);

      const key = `payments_${payment.sender}`;
      localStorage.setItem(key, JSON.stringify(updatedPayments.filter(p => p.sender === payment.sender)));

      const recipientIndex = recipients.findIndex(r => r.address === payment.recipient);
      if (recipientIndex >= 0) {
        recipients[recipientIndex].totalReceived += parseFloat(payment.amount);
        localStorage.setItem('recipients', JSON.stringify(recipients));
      }

      toast.success('Payment completed!');
      loadAdminData();
    } catch (error) {
      console.error('Failed to complete payment:', error);
      toast.error('Failed to complete payment');
    }
  };

  const cancelPayment = async (paymentId: string) => {
    try {
      const payment = payments.find(p => p.id === paymentId);
      if (!payment) return;

      const updated = { ...payment, status: 'Cancelled' as const };
      const updatedPayments = payments.map(p => p.id === paymentId ? updated : p);
      setPayments(updatedPayments);

      const key = `payments_${payment.sender}`;
      localStorage.setItem(key, JSON.stringify(updatedPayments.filter(p => p.sender === payment.sender)));

      toast.success('Payment cancelled');
      loadAdminData();
    } catch (error) {
      console.error('Failed to cancel payment:', error);
      toast.error('Failed to cancel payment');
    }
  };

  const verifyRecipient = async () => {
    if (!selectedRecipient || !bankAccount || !bankCode) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const updated = {
        ...selectedRecipient,
        verified: true,
        verifiedAt: new Date().toISOString(),
        bankAccount,
        bankCode,
      };

      const updatedRecipients = recipients.map(r =>
        r.address === selectedRecipient.address ? updated : r
      );
      setRecipients(updatedRecipients);
      localStorage.setItem('recipients', JSON.stringify(updatedRecipients));

      toast.success('Recipient verified!');
      setShowVerifyModal(false);
      setBankAccount('');
      setBankCode('');
      loadAdminData();
    } catch (error) {
      console.error('Failed to verify recipient:', error);
      toast.error('Failed to verify recipient');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <p className="text-purple-100">Manage payments, verify recipients, and monitor network activity</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {(
          [
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'payments', label: 'Payments', icon: Clock },
            { id: 'recipients', label: 'Recipients', icon: Users },
            { id: 'settings', label: 'Settings', icon: Settings },
          ] as const
        ).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-all ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Payments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalPayments}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Payments</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingPayments}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600 opacity-20" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completed Payments</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.completedPayments}</p>
              </div>
              <Check className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Volume</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">${stats.totalVolume.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm">Verified Recipients</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.verifiedRecipients}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-600 opacity-20" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm">Network Health</p>
                <p className="text-3xl font-bold text-green-600 mt-2">99.9%</p>
              </div>
              <Check className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Payment Management</h3>
          {payments.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-600">No payments found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map(payment => (
                <div key={payment.id} className="card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{payment.senderName} → {payment.recipientName}</p>
                      <p className="text-sm text-gray-600">
                        {payment.amount} {payment.currency} • {payment.paymentMethod}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge border text-sm capitalize ${
                        payment.status === 'Completed' ? 'bg-green-100 text-green-800 border-green-300' :
                        payment.status === 'Pending' || payment.status === 'Processing' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                        'bg-red-100 text-red-800 border-red-300'
                      }`}>
                        {payment.status}
                      </span>
                      {(payment.status === 'Pending' || payment.status === 'Processing') && (
                        <>
                          <button
                            onClick={() => completePayment(payment.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => cancelPayment(payment.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'recipients' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recipient Management</h3>
            <span className="text-sm text-gray-600">{recipients.length} recipients</span>
          </div>
          {recipients.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-600">No recipients found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recipients.map(recipient => (
                <div key={recipient.address} className="card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold">{recipient.name}</p>
                        {recipient.verified ? (
                          <span className="badge bg-green-100 text-green-800 border border-green-300 text-xs">
                            Verified
                          </span>
                        ) : (
                          <span className="badge bg-yellow-100 text-yellow-800 border border-yellow-300 text-xs">
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{recipient.country}</p>
                      <p className="text-xs text-gray-500 font-mono mt-1">{recipient.address}</p>
                      <p className="text-sm text-gray-600 mt-2">Total Received: ${recipient.totalReceived.toFixed(2)}</p>
                    </div>
                    {!recipient.verified && (
                      <button
                        onClick={() => {
                          setSelectedRecipient(recipient);
                          setShowVerifyModal(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Settings</h3>
          <div className="card space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin Fee (%)</label>
              <input
                type="number"
                defaultValue="0.5"
                className="input-base w-full md:w-48"
              />
              <p className="text-xs text-gray-600 mt-1">Fee charged on each transaction</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Daily Payment Limit</label>
              <input
                type="number"
                defaultValue="100000"
                className="input-base w-full md:w-48"
              />
              <p className="text-xs text-gray-600 mt-1">Maximum daily transaction volume</p>
            </div>

            <button className="btn-primary">Save Settings</button>
          </div>
        </div>
      )}

      {showVerifyModal && selectedRecipient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Verify Recipient</h3>
              <p className="text-sm text-gray-600 mt-1">{selectedRecipient.name}</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account</label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="Account number"
                  className="input-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Code</label>
                <input
                  type="text"
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  placeholder="SWIFT/BIC code"
                  className="input-base"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm text-blue-900">
                  ✓ Recipient will be able to receive bank transfers after verification
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowVerifyModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={verifyRecipient}
                className="flex-1 btn-primary"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
