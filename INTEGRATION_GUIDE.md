# Arc Cross-Border Payments - Integration Guide

## What Just Changed

The SendPayment form now **triggers real wallet transactions** when you click "Send Payment". Here's what happens:

### Transaction Flow

1. **User clicks "Connect Wallet"** on Step 3
   - Your wallet extension opens
   - You approve the connection
   - Your address is captured

2. **User clicks "Send Payment"**
   - **Step 1:** Request approval for USDC spending on the contract
     - Wallet pops up → Sign approval transaction
     - Wait for confirmation
   
   - **Step 2:** Call `initiatePayment()` on Arc smart contract
     - Wallet pops up → Sign payment transaction
     - Wait for confirmation
     - Payment ID is extracted from transaction logs

3. **Success!**
   - Transaction hash shown
   - Payment ID saved
   - Form resets for next payment

## What You Need to Configure

### 1. Contract Address
In `frontend/.env.local`:
```
NEXT_PUBLIC_ARC_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
```

Get this by deploying:
```bash
cd C:\Users\johns\Projects\arc-cross-border-payments
npm run deploy:testnet
```

### 2. Token Addresses
The form uses USDC. Make sure the token addresses in `.env.local` match what's deployed on Arc testnet:
```
NEXT_PUBLIC_ARC_USDC_ADDRESS=0xUSDC_ON_ARC_TESTNET
```

### 3. Wallet Setup
- Install MetaMask or compatible wallet
- Switch to Arc testnet (Chain ID: 1917)
- RPC: `https://testnet.arc.network/rpc`
- Have some test tokens (USDC) in your wallet

## Testing the Integration

### Step 1: Have Test Tokens
You need USDC test tokens. Get from:
- Arc faucet: https://testnet.arc.network/faucet
- Circle testnet faucet

### Step 2: Run Dev Server
```bash
cd frontend
npm run dev
```

### Step 3: Test Form
1. Go to `localhost:3000`
2. Click "Send Payment" tab
3. Form auto-fills with sample data
4. Click through steps
5. On Step 3: Click "Connect Wallet"
6. Click "Send Payment"
7. **Watch your wallet pop up** with signature requests

### What You Should See

```
📤 Preparing payment transaction
1️⃣ Step 1: Approving token...
   → Wallet popup: Sign approval
   → Wait for confirmation

✅ Token approval confirmed
2️⃣ Step 2: Initiating payment on Arc...
   → Wallet popup: Sign payment
   → Wait for confirmation

✅ Payment submitted! Transaction: 0x...
```

## Debugging

### If wallet popup doesn't appear:
1. Check browser console (F12)
2. Look for error messages
3. Make sure wallet is:
   - Installed
   - Unlocked
   - Set to Arc testnet

### If transaction fails:
Check these:
- Do you have USDC tokens? (Check wallet balance)
- Is the amount valid? (Must be > 0)
- Is the contract address correct?
- Is the token address correct?
- Is the wallet on the right chain?

Check console logs for exact error

### Contract Errors Common Issues:
- `"Token not supported"` → Token address wrong or not set on contract
- `"Amount exceeds maximum"` → Amount too high (max 100,000 USDC)
- `"Invalid recipient"` → Recipient wallet address invalid
- `"Contract call failed"` → Contract may not be deployed or wrong address

## Next Steps

1. **Deploy the contract** to Arc testnet
2. **Update `.env.local`** with actual addresses
3. **Test the form** with real tokens
4. **Implement PaymentHistory** to show past transactions
5. **Add exchange rates** for different currencies
6. **Implement recipient verification** for bank payouts

## Files Modified

- `frontend/src/components/SendPayment.tsx` - Added contract calls to handleSubmit
- `frontend/src/hooks/useArcPayments.ts` - Web3 integration hook
- `frontend/src/lib/contracts.ts` - Contract ABIs and addresses
- `frontend/.env.local` - Environment configuration

## Key Functions

### `approveToken(tokenAddress, spenderAddress, amount)`
Calls ERC20 approve to let contract spend tokens

### `initiatePayment(recipient, token, amount, recipientCountry, senderCountry, paymentMethod)`
Creates payment record on-chain

### `getPaymentDetails(paymentId)`
Fetches payment data from contract

### `getUserPayments(address)`
Gets all payments for a user
