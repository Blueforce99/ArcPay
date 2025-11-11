'use client';

import React, { useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

const DEBUG_CONTRACT_ABI = [
  // initiatePayment function
  {
    inputs: [
      { internalType: 'address', name: '_recipient', type: 'address' },
      { internalType: 'address', name: '_token', type: 'address' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
      { internalType: 'string', name: '_recipientCountry', type: 'string' },
      { internalType: 'string', name: '_senderCountry', type: 'string' },
      { internalType: 'string', name: '_paymentMethod', type: 'string' },
    ],
    name: 'initiatePayment',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export default function DebugPayment() {
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string[]>([]);

  const log = (msg: string) => {
    console.log(msg);
    setOutput(prev => [...prev, msg]);
  };

  const handleTestPayment = async () => {
    setOutput([]);
    setLoading(true);

    try {
      log('🔌 [1] Getting window.ethereum...');
      
      if (!window.ethereum) {
        throw new Error('MetaMask not found');
      }
      log('✅ Found window.ethereum');

      log('🔌 [2] Creating provider...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      log('✅ Created BrowserProvider');

      log('🔌 [3] Getting signer...');
      const signer = await provider.getSigner();
      log(`✅ Got signer: ${await signer.getAddress()}`);

      const signerAddress = await signer.getAddress();
      log(`📋 Signer address: ${signerAddress}`);

      log('🔌 [4] Checking USDC balance...');
      const USDC_ADDRESS = '0x3600000000000000000000000000000000000000';
      const usdcContract = new ethers.Contract(
        USDC_ADDRESS,
        [
          {
            name: 'balanceOf',
            outputs: [{ type: 'uint256' }],
            inputs: [{ type: 'address' }],
            stateMutability: 'view',
            type: 'function',
          },
          {
            name: 'approve',
            outputs: [{ type: 'bool' }],
            inputs: [
              { type: 'address' },
              { type: 'uint256' },
            ],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
        provider
      );

      const balance = await usdcContract.balanceOf(signerAddress);
      log(`💰 USDC balance: ${ethers.formatUnits(balance, 6)} USDC`);

      if (balance == 0n) {
        throw new Error('No USDC balance! Please get USDC from faucet first');
      }

      log('🔌 [5] Creating contract instance...');
      const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_ARC_CONTRACT_ADDRESS || '0x75646fd9b8fADa1456B600315c5F8EB76FA53eaa').toLowerCase();
      const paymentContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        DEBUG_CONTRACT_ABI,
        signer
      );
      log(`✅ Created contract instance: ${CONTRACT_ADDRESS}`);

      log('🔌 [6] Checking if contract has initiatePayment function...');
      const iface = paymentContract.interface;
      const fragment = iface.getFunction('initiatePayment');
      if (fragment) {
        log(`✅ Function exists: ${fragment.name}`);
      } else {
        throw new Error('initiatePayment function not found in ABI');
      }

      log('🔌 [7] Approving USDC to contract...');
      const usdcWithSigner = new ethers.Contract(USDC_ADDRESS, [
        {
          name: 'approve',
          outputs: [{ type: 'bool' }],
          inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' },
          ],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ], signer);

      const approveAmount = ethers.parseUnits('0.1', 6); // 0.1 USDC
      log(`  Approving: ${ethers.formatUnits(approveAmount, 6)} USDC`);
      log(`  Spender (Contract): ${CONTRACT_ADDRESS}`);
      
      const approveTx = await usdcWithSigner.approve(CONTRACT_ADDRESS, approveAmount);
      log(`📝 Approval tx: ${approveTx.hash}`);
      
      const approveReceipt = await approveTx.wait();
      log(`✅ Approval confirmed: ${approveReceipt?.hash}`);

      log('🔌 [8] Encoding initiatePayment call...');
      const encodedCall = paymentContract.interface.encodeFunctionData('initiatePayment', [
        '0x0000000000000000000000000000000000000001', // recipient
        USDC_ADDRESS, // token
        approveAmount, // amount
        'US', // recipientCountry
        'US', // senderCountry
        'crypto', // paymentMethod
      ]);
      log(`✅ Encoded call: ${encodedCall.substring(0, 66)}...`);

      log('🔌 [9] Creating initiatePayment transaction...');
      const tx = await paymentContract.initiatePayment(
        '0x0000000000000000000000000000000000000001', // recipient
        USDC_ADDRESS, // token
        approveAmount, // amount
        'US', // recipientCountry
        'US', // senderCountry
        'crypto', // paymentMethod
        {
          gasLimit: 300000n,
        }
      );
      
      log(`📝 Payment tx: ${tx.hash}`);
      log(`  From: ${tx.from}`);
      log(`  To: ${tx.to}`);
      log(`  Data: ${tx.data?.substring(0, 66)}...`);

      log('🔌 [10] Waiting for payment tx confirmation...');
      const receipt = await tx.wait();
      
      if (receipt) {
        log(`✅ Payment confirmed!`);
        log(`  TxHash: ${receipt.hash}`);
        log(`  Block: ${receipt.blockNumber}`);
        log(`  Gas used: ${receipt.gasUsed.toString()}`);
        
        if (receipt.logs.length > 0) {
          log(`  Logs: ${receipt.logs.length} event(s)`);
          receipt.logs.forEach((log, idx) => {
            try {
              const event = paymentContract.interface.parseLog(log);
              if (event) {
                log(`    Event ${idx}: ${event.name}`);
              }
            } catch (e) {
              // Not an event from our contract
            }
          });
        }
      } else {
        throw new Error('Transaction failed or reverted');
      }

      log('🎉 Payment successful!');
      toast.success('✅ Payment sent successfully!');
    } catch (err: any) {
      log(`❌ ERROR: ${err.message}`);
      console.error('Full error:', err);
      toast.error(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="card space-y-4">
        <h2 className="text-2xl font-bold">🧪 Debug Payment Test</h2>
        <p className="text-gray-600">This will test the payment flow step by step and show you exactly where it fails.</p>
        
        <button
          onClick={handleTestPayment}
          disabled={loading}
          className="w-full btn-primary disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Run Test Payment'}
        </button>

        {output.length > 0 && (
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-y-auto max-h-96 space-y-1">
            {output.map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
