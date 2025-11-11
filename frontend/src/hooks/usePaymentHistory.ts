import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useOnboardContext } from '@/contexts/OnboardContext';
import { CROSS_BORDER_PAYMENTS_ABI, ARC_CONFIG, PAYMENT_STATUS_LABELS, PaymentStatus } from '@/lib/contracts';

export interface BlockchainPayment {
  id: string;
  sender: string;
  recipient: string;
  amount: string;
  feeAmount: string;
  token: string;
  recipientCountry: string;
  senderCountry: string;
  timestamp: Date;
  status: string;
  paymentMethod: string;
  txHash?: string;
}

export function usePaymentHistory(contractAddress?: string) {
  const [payments, setPayments] = useState<BlockchainPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'blockchain' | 'localStorage'>('blockchain');
  
  const { provider, address: userAddress } = useOnboardContext();
  
  const normalizedContractAddress = (contractAddress || ARC_CONFIG.testnet.contractAddress).toLowerCase();

  // Fallback: Load from localStorage
  const loadFromLocalStorage = useCallback(async () => {
    try {
      console.log('💾 Loading payments from localStorage (fallback)...');
      if (!userAddress) return;

      const key = `payments_${userAddress}`;
      const stored = localStorage.getItem(key);
      
      if (stored) {
        const storedPayments = JSON.parse(stored);
        console.log('✅ Loaded', storedPayments.length, 'payments from localStorage');
        
        // Transform to match BlockchainPayment format
        const transformed: BlockchainPayment[] = storedPayments.map((p: any) => ({
          id: p.id,
          sender: p.sender,
          recipient: p.recipient,
          amount: p.amount,
          feeAmount: '0',
          token: p.token || (process.env.NEXT_PUBLIC_ARC_USDC_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b1566469cb3'),
          recipientCountry: p.recipientCountry,
          senderCountry: p.senderCountry || 'US',
          timestamp: new Date(p.timestamp),
          status: p.status,
          paymentMethod: p.paymentMethod,
          txHash: p.txHash,
        }));
        
        setPayments(transformed);
        setSource('localStorage');
        return;
      }
      
      console.log('ℹ️ No payments found in localStorage');
      setPayments([]);
    } catch (err: any) {
      console.error('❌ localStorage fallback error:', err);
      setPayments([]);
    }
  }, [userAddress]);

  // Fetch all user payments from blockchain
  const fetchPaymentHistory = useCallback(async () => {
    if (!userAddress || !provider) {
      console.warn('⚠️ usePaymentHistory: Missing userAddress or provider');
      loadFromLocalStorage();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📜 Fetching payment history for:', userAddress);
      console.log('🔗 Contract address:', normalizedContractAddress);

      // Create contract instance
      const contract = new ethers.Contract(
        normalizedContractAddress,
        CROSS_BORDER_PAYMENTS_ABI,
        provider
      );

      // Check if contract exists by calling a function
      console.log('✔️ Verifying contract exists...');
      try {
        const code = await provider.getCode(normalizedContractAddress);
        if (code === '0x') {
          console.warn('⚠️ Contract not deployed at this address. Using localStorage fallback.');
          await loadFromLocalStorage();
          setError('Contract not deployed on Arc testnet. Showing local data.');
          return;
        }
        console.log('✅ Contract found');
      } catch (codeErr: any) {
        console.warn('⚠️ Contract verification skipped. Using localStorage fallback.');
        await loadFromLocalStorage();
        setError('Could not verify contract. Showing local data.');
        return;
      }

      // Get payment IDs for this user
      console.log('📋 Calling getUserPayments...');
      let paymentIds;
      
      try {
        paymentIds = await contract.getUserPayments(userAddress.toLowerCase());
        console.log('✅ Got payment IDs:', paymentIds.length, paymentIds);
      } catch (err: any) {
        console.error('❌ getUserPayments error:', err.message);
        console.warn('⚠️ Falling back to localStorage');
        await loadFromLocalStorage();
        setError('Could not fetch from blockchain, showing local data');
        return;
      }

      if (!paymentIds || paymentIds.length === 0) {
        console.log('ℹ️ No payments found for user on blockchain');
        setPayments([]);
        setSource('blockchain');
        return;
      }

      // Fetch details for each payment
      console.log('🔍 Fetching details for', paymentIds.length, 'payments...');
      const paymentPromises = paymentIds.map((id: ethers.BigNumberish) =>
        contract.getPayment(id).catch((err: any) => {
          console.error('Error fetching payment', id.toString(), ':', err.message);
          return null;
        })
      );

      const paymentDetails = await Promise.all(paymentPromises);
      const validPayments = paymentDetails.filter((p: any) => p !== null);

      if (validPayments.length === 0) {
        console.log('⚠️ No valid payment details could be fetched');
        setPayments([]);
        setSource('blockchain');
        return;
      }

      // Transform contract data to our format
      const transformedPayments: BlockchainPayment[] = validPayments.map(
        (payment: any) => ({
          id: payment.id.toString(),
          sender: payment.sender,
          recipient: payment.recipient,
          amount: ethers.formatUnits(payment.amount, 6), // USDC has 6 decimals
          feeAmount: ethers.formatUnits(payment.feeAmount, 6),
          token: payment.token,
          recipientCountry: payment.recipientCountry,
          senderCountry: payment.senderCountry,
          timestamp: new Date(Number(payment.timestamp) * 1000),
          status: PAYMENT_STATUS_LABELS[payment.status as PaymentStatus] || 'Unknown',
          paymentMethod: payment.paymentMethod,
        })
      );

      // Sort by timestamp (newest first)
      transformedPayments.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      console.log('✅ Loaded', transformedPayments.length, 'payments from blockchain');
      setPayments(transformedPayments);
      setSource('blockchain');
    } catch (err: any) {
      const message = err.message || 'Failed to fetch payment history';
      console.error('❌ Payment history error:', err);
      console.warn('⚠️ Attempting localStorage fallback...');
      setError(`Blockchain error: ${message}`);
      await loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  }, [userAddress, provider, normalizedContractAddress, loadFromLocalStorage]);

  // Auto-fetch when userAddress changes
  useEffect(() => {
    if (userAddress) {
      fetchPaymentHistory();
    } else {
      setPayments([]);
      setError(null);
    }
  }, [userAddress, fetchPaymentHistory]);

  return {
    payments,
    loading,
    error,
    refetch: fetchPaymentHistory,
    source,
  };
}
