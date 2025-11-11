# Arc Cross-Border Payments - Complete Feature Guide

## 🎯 Project Overview

Arc Cross-Border Payments is a comprehensive DeFi application built on Circle's Arc testnet. It enables seamless, low-cost international payments with support for multiple currencies, payment methods, and institutional features.

## ✨ Features

### 1. **Send Payments** 📤
- Multi-step form (Sender Info → Recipient Info → Payment Details)
- Support for 11+ countries and currencies
- Three payment methods: Crypto, Bank Transfer, Cash Pickup
- Real-time exchange rate display
- Automatic fee calculation (0.5% crypto, 1% bank, 2% cash)
- Pre-filled sample data for testing
- Wallet integration (MetaMask, Rabby, etc.)

### 2. **Payment History** 📋
- View all sent/received payments
- Filter by status (All, Pending, Completed, Failed)
- Payment details with transaction hash
- Direct links to Arc Testnet explorer
- Copy wallet addresses and transaction hashes
- Sender/recipient information

### 3. **Exchange Rates & Currency Conversion** 💱
- Supports 11 major currencies (USD, PHP, INR, NGN, KES, MXN, BRL, ARS, SGD, AED, GBP, EUR)
- Real-time exchange rate calculation
- Automatic fee estimation
- Currency formatting with symbols
- Mock rates (replace with live API for production)

### 4. **Admin Dashboard** 🛡️
Access with password: `admin123`

#### Dashboard Overview:
- **Total Payments**: Overall transaction count
- **Pending Payments**: Awaiting completion
- **Completed Payments**: Successfully settled
- **Total Volume**: USD value of all transactions
- **Verified Recipients**: KYC-verified users
- **Network Health**: System status

#### Payment Management:
- View all network payments
- Complete pending payments
- Cancel payments
- Update payment status to "Completed" or "Cancelled"

#### Recipient Verification:
- Verify recipients for bank transfers
- Collect bank account details
- Require SWIFT/BIC codes
- Track total received per recipient
- Mark recipients as verified

#### Settings:
- Configure admin fees
- Set daily payment limits
- Set minimum KYC verification amount
- Manage network parameters

## 🏗️ Architecture

### Frontend Stack
- **Framework**: Next.js 14 + React 18
- **Styling**: Tailwind CSS
- **State Management**: React Hooks + localStorage
- **Web3**: ethers.js v6 + Wagmi
- **Notifications**: React Toastify

### Smart Contracts
- **Network**: Arc Testnet (Chain ID: 5042002)
- **Contract**: CrossBorderPayments.sol (0x742d35Cc... on testnet)
- **Functions**:
  - `initiatePayment()` - Create new payment
  - `completePayment()` - Settle payment
  - `cancelPayment()` - Refund payment
  - `verifyRecipient()` - KYC verification

### Data Flow
```
User Form Input
    ↓
Local Validation
    ↓
Wallet Connection (MetaMask)
    ↓
Token Approval (USDC)
    ↓
Contract Call (initiatePayment)
    ↓
Transaction Confirmation
    ↓
Save to localStorage
    ↓
Update Payment History
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MetaMask or compatible wallet
- Test USDC tokens on Arc testnet

### Installation

```bash
# Install dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Create environment file
cp frontend/.env.local.example frontend/.env.local
```

### Configuration

Update `frontend/.env.local`:
```bash
# Arc Network
NEXT_PUBLIC_ARC_CHAIN_ID=5042002
NEXT_PUBLIC_ARC_RPC_URL=https://5042002.rpc.thirdweb.com

# Contracts (update with deployed addresses)
NEXT_PUBLIC_ARC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_ARC_USDC_ADDRESS=0x...

# Admin Password
NEXT_PUBLIC_ADMIN_PASSWORD=admin123
```

### Running Locally

```bash
# Start development server
cd frontend
npm run dev

# Open http://localhost:3000
```

## 💡 Usage Guide

### Sending a Payment

1. **Connect Wallet**
   - Click "Connect Wallet" on Step 3
   - Approve wallet connection in MetaMask

2. **Fill Sender Info**
   - Name, Email, Phone
   - Click "Continue"

3. **Add Recipient**
   - Recipient name, email, phone
   - Select country (auto-sets currency)
   - Enter address and wallet
   - Click "Continue"

4. **Review Payment**
   - Confirm exchange rate and fees
   - Select payment method
   - Connect wallet
   - Click "Send Payment"

5. **Sign Transactions**
   - Transaction 1: USDC Approval
   - Transaction 2: Payment Initiation
   - Wait for confirmation

### Checking Payment History

1. Click **"Payment History"** tab
2. Filter by status (All, Pending, Completed, Failed)
3. Click external link icon to view on Arc Testnet explorer

### Admin Operations

1. Click **"Admin Mode"** button
2. Enter password: `admin123`
3. Access **Admin Dashboard**

#### Complete a Payment:
- Go to "Payments" tab
- Click "Complete" on pending payment
- Payment status updates to "Completed"

#### Verify Recipient:
- Go to "Recipients" tab
- Click "Verify" on unverified recipient
- Enter bank account and SWIFT code
- Recipient marked as verified

## 📊 Exchange Rates

Current supported rates (mock data):
```
1 USD = 56.50 PHP
1 USD = 83.12 INR
1 USD = 1,550.00 NGN
1 USD = 130.50 KES
1 USD = 17.20 MXN
1 USD = 4.97 BRL
1 USD = 1,045.00 ARS
1 USD = 1.34 SGD
1 USD = 3.67 AED
1 USD = 0.79 GBP
1 USD = 0.92 EUR
```

**Update in production**: Replace `EXCHANGE_RATES` in `/frontend/src/lib/exchangeRates.ts` with live API data (Coingecko, Fixer.io, etc.)

## 🔐 Security Features

- ✅ ERC20 token approval pattern
- ✅ ReentrancyGuard on smart contract
- ✅ Address checksum validation
- ✅ Wallet address validation (ethers.isAddress)
- ✅ Admin password protection
- ✅ Payment status validation
- ✅ Recipient verification for bank transfers

## 📁 Project Structure

```
arc-cross-border-payments/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx          # Main dashboard
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── Header.tsx        # Wallet connection
│   │   │   ├── SendPayment.tsx   # Payment form
│   │   │   ├── PaymentHistory.tsx # Payment list
│   │   │   └── AdminDashboard.tsx # Admin panel
│   │   ├── hooks/
│   │   │   └── useArcPayments.ts # Web3 integration
│   │   └── lib/
│   │       ├── exchangeRates.ts  # Currency conversion
│   │       └── contracts.ts      # Contract ABIs
│   ├── package.json
│   └── .env.local
├── contracts/
│   └── CrossBorderPayments.sol   # Smart contract
├── scripts/
│   └── deploy.js                 # Deployment script
└── README.md
```

## 🧪 Testing

### Test Flow

1. **Connect Wallet**
   - Use MetaMask on Arc testnet
   - Have test USDC tokens

2. **Send Payment**
   - Fill form with sample data
   - Approve USDC spending
   - Sign payment transaction
   - Verify transaction on explorer

3. **View History**
   - Payment appears in history with status "Processing"
   - Click explorer link to see transaction details

4. **Admin Operations**
   - Toggle admin mode
   - Complete pending payment
   - Verify recipient
   - Check updated stats

### Debugging

Enable console logging:
```javascript
// Check browser console (F12 → Console tab)
// Look for logs like:
// 📤 STARTING PAYMENT FLOW
// 1️⃣ APPROVING USDC TOKEN
// 2️⃣ INITIATING PAYMENT ON ARC
// ✅ PAYMENT RESULT
```

## 🔗 Useful Links

- **Arc Testnet Explorer**: https://testnet.arcscan.app/
- **Arc Documentation**: https://docs.arc.network/
- **Circle**: https://www.circle.com/
- **Thirdweb**: https://thirdweb.com/arc-testnet

## 📝 Environment Variables

```bash
# Required
NEXT_PUBLIC_ARC_CHAIN_ID=5042002
NEXT_PUBLIC_ARC_RPC_URL=https://5042002.rpc.thirdweb.com

# Optional (uses defaults if not set)
NEXT_PUBLIC_ARC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_ARC_USDC_ADDRESS=0x...
NEXT_PUBLIC_ADMIN_PASSWORD=admin123
```

## 🚦 Next Steps

1. **Deploy Contract** - Deploy to Arc mainnet
2. **Live Exchange Rates** - Integrate with rate API
3. **KYC Integration** - Add proper identity verification
4. **Payment Notifications** - Email/SMS updates
5. **Multi-language** - Support more languages
6. **Mobile App** - React Native version
7. **Mainnet Launch** - Deploy to production

## 📞 Support

For issues or questions:
1. Check browser console for errors (F12)
2. Verify wallet is on Arc testnet
3. Ensure you have test USDC tokens
4. Check Arc Testnet explorer for transaction details

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ for the Arc ecosystem**
