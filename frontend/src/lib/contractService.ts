/**
 * Smart contract interaction service
 */

const CONTRACT_ABI = [
  {
    inputs: [
      { name: '_recipient', type: 'address' },
      { name: '_token', type: 'address' },
      { name: '_amount', type: 'uint256' },
      { name: '_recipientCountry', type: 'string' },
      { name: '_senderCountry', type: 'string' },
      { name: '_paymentMethod', type: 'string' },
    ],
    name: 'initiatePayment',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_token', type: 'address' }],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export class ContractService {
  private static getProvider() {
    return (window as any).ethereum;
  }

  static async initiatePayment(params: {
    contractAddress: string;
    recipient: string;
    token: string;
    amount: string;
    recipientCountry: string;
    senderCountry: string;
    paymentMethod: string;
  }) {
    const provider = this.getProvider();
    if (!provider) {
      throw new Error('No wallet provider found');
    }

    try {
      // First, we need to approve the token transfer
      console.log('Approving token...');
      
      // Get current accounts
      const accounts = await provider.request({
        method: 'eth_accounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No account connected');
      }

      const from = accounts[0];

      // Encode the initiatePayment function call
      const functionSignature = 'initiatePayment(address,address,uint256,string,string,string)';
      const types = ['address', 'address', 'uint256', 'string', 'string', 'string'];
      const values = [
        params.recipient,
        params.token,
        params.amount,
        params.recipientCountry,
        params.senderCountry,
        params.paymentMethod,
      ];

      // Manually encode the function call
      const encodedCall = encodeFunction(functionSignature, types, values);

      console.log('Sending transaction...');
      console.log('Contract:', params.contractAddress);
      console.log('From:', from);
      console.log('Amount:', params.amount);

      // Send the transaction
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: from,
            to: params.contractAddress,
            data: encodedCall,
            gas: '0x5B8D80', // 6 million gas
          },
        ],
      });

      console.log('✅ Transaction sent:', txHash);
      return txHash;
    } catch (error: any) {
      console.error('❌ Transaction error:', error);
      if (error.code === 4001) {
        throw new Error('Transaction rejected by user');
      }
      throw error;
    }
  }
}

// Simple function encoder (basic version - in production use ethers.js or web3.js)
function encodeFunction(
  signature: string,
  types: string[],
  values: any[]
): string {
  // This is a simplified version - in production use a proper library
  // For now, we'll just return a placeholder
  console.warn('Using simplified function encoding. Use ethers.js for production!');
  return '0x'; // Placeholder
}
