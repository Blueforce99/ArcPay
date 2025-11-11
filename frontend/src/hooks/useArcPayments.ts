import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { useOnboardContext } from '@/contexts/OnboardContext';
import { getOnboard, switchToArcNetwork } from '@/lib/onboard';
import {
  CROSS_BORDER_PAYMENTS_ABI,
  ERC20_ABI,
  ARC_CONFIG,
  GAS_LIMITS,
  PaymentStatus,
  PAYMENT_STATUS_LABELS,
} from '@/lib/contracts';

interface UseArcPaymentsProps {
  contractAddress?: string;
  onPaymentInitiated?: (paymentId: string) => void;
  onPaymentCompleted?: (paymentId: string) => void;
}

export function useArcPayments({
  contractAddress = ARC_CONFIG.testnet.contractAddress,
  onPaymentInitiated,
  onPaymentCompleted,
}: UseArcPaymentsProps = {}) {
  // Ensure address is lowercase to avoid checksum errors
  const normalizedContractAddress = contractAddress?.toLowerCase() || '';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use onboard context
  const { provider, address: userAddress, isConnected } = useOnboardContext();

  // Get provider and signer
  const getSigner = useCallback(async () => {
    if (!provider) {
      throw new Error('Provider not initialized');
    }
    const signer = await provider.getSigner();
    return signer;
  }, [provider]);

  // Connect wallet - open modal
  const connectWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔌 connectWallet called');
      
      const onboard = getOnboard();
      console.log('📦 onboard instance:', onboard);
      console.log('📦 onboard.connectWallet:', onboard?.connectWallet);
      
      if (!onboard || !onboard.connectWallet) {
        throw new Error('Onboard or connectWallet not available');
      }
      
      console.log('🔌 Calling onboard.connectWallet()...');
      const wallets = await onboard.connectWallet();
      console.log('✅ connectWallet returned:', wallets);
      
      if (!wallets || wallets.length === 0) {
        console.warn('⚠️ No wallets returned from connectWallet');
        throw new Error('No wallet selected');
      }
      
      console.log('✅ Successfully connected wallet:', wallets[0].label);
      
      // Step 2: Switch to Arc network
      console.log('🔀 Switching to Arc network after wallet connection...');
      try {
        await switchToArcNetwork();
        console.log('✅ Successfully switched to Arc network');
      } catch (networkErr: any) {
        console.warn('⚠️ Network switch failed:', networkErr.message);
        toast.warning('⚠️ Failed to switch network. Please switch manually to Arc Testnet (5042002)');
        // Don't throw - wallet is connected even if network switch fails
      }
    } catch (err: any) {
      const message = err.message || 'Failed to connect wallet';
      console.error('❌ Connection error:', message, err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Approve token spending
  const approveToken = useCallback(
    async (tokenAddress: string, spenderAddress: string, amount: string) => {
      try {
        if (!provider) {
          throw new Error('Wallet not connected');
        }

        setLoading(true);
        setError(null);

        console.log('📝 Approving token:', {
          token: tokenAddress,
          spender: spenderAddress,
          amount,
        });

        const signer = await getSigner();
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

        const amountBigInt = ethers.parseUnits(amount, 6); // Assuming 6 decimals

        const tx = await tokenContract.approve(spenderAddress, amountBigInt, {
          gasLimit: GAS_LIMITS.approve,
        });

        console.log('⏳ Approval pending:', tx.hash);
        toast.info('⏳ Approval pending...');

        const receipt = await tx.wait();

        console.log('✅ Approval confirmed:', receipt?.hash);
        toast.success('✅ Token approval confirmed');

        return receipt;
      } catch (err: any) {
        const message = err.message || 'Token approval failed';
        setError(message);
        console.error('❌ Approval error:', err);
        toast.error(`❌ ${message}`);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [provider, getSigner]
  );

  // Initiate payment on contract
  const initiatePayment = useCallback(
    async (
      recipientAddress: string,
      tokenAddress: string,
      amount: string,
      recipientCountry: string,
      senderCountry: string,
      paymentMethod: string
    ) => {
      try {
        if (!provider) {
          throw new Error('Wallet not connected');
        }

        if (!normalizedContractAddress) {
          throw new Error('Contract address not configured');
        }

        setLoading(true);
        setError(null);

        console.log('💳 Initiating payment:', {
          recipient: recipientAddress,
          token: tokenAddress,
          amount,
          recipientCountry,
          senderCountry,
          paymentMethod,
        });

        const signer = await getSigner();
        const contract = new ethers.Contract(
          normalizedContractAddress,
          CROSS_BORDER_PAYMENTS_ABI,
          signer
        );

        const amountBigInt = ethers.parseUnits(amount, 6); // Assuming 6 decimals

        const tx = await contract.initiatePayment(
          recipientAddress.toLowerCase(),
          tokenAddress.toLowerCase(),
          amountBigInt,
          recipientCountry,
          senderCountry,
          paymentMethod,
          {
            gasLimit: GAS_LIMITS.initiatePayment,
          }
        );

        console.log('⏳ Payment initiated:', tx.hash);
        toast.info('⏳ Payment processing...');

        const receipt = await tx.wait();

        // Extract payment ID from events
        const event = receipt?.logs
          ?.map((log: any) => {
            try {
              return contract.interface.parseLog(log);
            } catch {
              return null;
            }
          })
          .find(e => e?.name === 'PaymentInitiated');

        const paymentId = event?.args?.paymentId?.toString();

        console.log('✅ Payment initiated:', {
          paymentId,
          txHash: receipt?.hash,
        });

        toast.success(`✅ Payment initiated! ID: ${paymentId}`);

        if (paymentId && onPaymentInitiated) {
          onPaymentInitiated(paymentId);
        }

        return {
          paymentId,
          txHash: receipt?.hash,
          receipt,
        };
      } catch (err: any) {
        const message = err.message || 'Payment initiation failed';
        setError(message);
        console.error('❌ Payment error:', err);
        toast.error(`❌ ${message}`);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [provider, normalizedContractAddress, getSigner, onPaymentInitiated]
  );

  // Get payment details
  const getPaymentDetails = useCallback(
    async (paymentId: string) => {
      try {
        if (!provider) {
          throw new Error('Provider not initialized');
        }

        if (!normalizedContractAddress) {
          throw new Error('Contract address not configured');
        }

        const contract = new ethers.Contract(
          normalizedContractAddress,
          CROSS_BORDER_PAYMENTS_ABI,
          provider
        );

        const payment = await contract.getPayment(paymentId);

        console.log('📋 Payment details:', payment);

        return {
          id: payment.id.toString(),
          sender: payment.sender,
          recipient: payment.recipient,
          token: payment.token,
          amount: ethers.formatUnits(payment.amount, 6),
          feeAmount: ethers.formatUnits(payment.feeAmount, 6),
          recipientCountry: payment.recipientCountry,
          senderCountry: payment.senderCountry,
          timestamp: new Date(Number(payment.timestamp) * 1000),
          status: PAYMENT_STATUS_LABELS[payment.status as PaymentStatus],
          paymentMethod: payment.paymentMethod,
        };
      } catch (err: any) {
        console.error('❌ Error getting payment:', err);
        throw err;
      }
    },
    [provider, normalizedContractAddress]
  );

  // Get user's payment history
  const getUserPayments = useCallback(
    async (userAddress: string) => {
      try {
        if (!provider) {
          throw new Error('Provider not initialized');
        }

        if (!normalizedContractAddress) {
          throw new Error('Contract address not configured');
        }

        const contract = new ethers.Contract(
          normalizedContractAddress,
          CROSS_BORDER_PAYMENTS_ABI,
          provider
        );

        const paymentIds = await contract.getUserPayments(userAddress.toLowerCase());

        console.log('📜 User payments:', paymentIds);

        return paymentIds.map((id: ethers.BigNumberish) => id.toString());
      } catch (err: any) {
        console.error('❌ Error getting user payments:', err);
        throw err;
      }
    },
    [provider, normalizedContractAddress]
  );

  return {
    loading,
    error,
    userAddress,
    connectWallet,
    approveToken,
    initiatePayment,
    getPaymentDetails,
    getUserPayments,
    isConnected,
  };
}
