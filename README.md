# Arc Cross-Border Payments

A modern, high-performance cross-border payment platform built on Arc testnet. Send remittances globally with minimal fees, transparent rates, and instant settlement.

## 🚀 Features

- **Multiple Payment Methods**: Crypto wallet, bank transfer, and cash pickup options
- **Global Coverage**: Support for 180+ countries
- **Real Exchange Rates**: Live rates with no hidden fees
- **Fast Settlement**: Block confirmation in minutes
- **Beautiful UI**: Top-tier frontend experience for Arc ecosystem
- **Batch Processing**: Handle multiple payments efficiently
- **Recipient Verification**: KYC support for regulatory compliance
- **Multi-token Support**: USDC, USDT, DAI, and more

## 📋 Project Structure

```
arc-cross-border-payments/
├── contracts/
│   └── CrossBorderPayments.sol          # Main smart contract
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx               # Root layout
│   │   │   ├── page.tsx                 # Main dashboard
│   │   │   └── globals.css              # Global styles
│   │   ├── components/
│   │   │   ├── Header.tsx               # Navigation header
│   │   │   ├── HeroSection.tsx          # Landing section
│   │   │   ├── SendPayment.tsx          # Payment form
│   │   │   ├── PaymentHistory.tsx       # Transaction history
│   │   │   └── StatsCards.tsx           # Dashboard cards
│   │   ├── contexts/
│   │   │   └── PaymentContext.tsx       # Web3 context
│   │   ├── lib/
│   │   │   ├── constants.ts             # App constants
│   │   │   └── utils.ts                 # Utility functions
│   │   └── hooks/                       # Custom React hooks
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── tsconfig.json
├── scripts/
│   ├── deploy.js                        # Deployment script
│   └── verify.js                        # Contract verification
├── hardhat.config.js
├── package.json
└── README.md
```

## 🛠️ Tech Stack

**Smart Contracts:**
- Solidity 0.8.20
- OpenZeppelin contracts
- Hardhat for development
- ReentrancyGuard for security

**Frontend:**
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Wagmi & Rainbow Kit for Web3
- Zustand for state management
- Framer Motion for animations
- Recharts for analytics

**Blockchain:**
- Arc testnet
- ERC-20 token support
- Multi-sig capabilities

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- MetaMask or compatible wallet

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/arc-cross-border-payments.git
cd arc-cross-border-payments
```

2. Install dependencies:
```bash
npm install
cd frontend && npm install && cd ..
```

3. Create `.env` file:
```bash
cp .env.example .env
# Add your private key and RPC endpoints
```

4. Deploy smart contract:
```bash
npm run deploy:testnet
```

5. Run frontend:
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` to see the app.

## 📱 Usage

### For Senders:
1. Connect your wallet
2. Fill in recipient details
3. Select payment method
4. Review transaction
5. Confirm and sign

### For Recipients:
- Receive notifications via email
- Claim funds directly to wallet
- Track payment status in real-time

## 💡 Smart Contract Functions

### Core Functions:
- `initiatePayment()` - Start a new payment
- `completePayment()` - Process and settle payment
- `batchCompletePayments()` - Batch processing
- `cancelPayment()` - Refund a pending payment

### Admin Functions:
- `setExchangeRate()` - Update token rates
- `verifyRecipient()` - KYC verification
- `setFeePercentage()` - Adjust fees
- `withdrawFees()` - Collect fees

## 🔒 Security

- Multi-sig wallet support
- ReentrancyGuard on all state-changing functions
- Pausable contract for emergencies
- Rate limiting per sender
- Input validation and sanitization
- Overflow/underflow protection via Solidity 0.8.20

## 📊 Supported Tokens

- USDC (USD Coin)
- USDT (Tether)
- DAI (Dai Stablecoin)
- More tokens can be added via governance

## 🌍 Supported Countries

180+ countries across:
- North America
- South America
- Europe
- Asia
- Africa
- Middle East
- Oceania

## 📈 Fee Structure

- Default: 0.5% per transaction
- Minimum: $1
- Maximum: $100,000
- Volume discounts available

## 🤝 Contributing

Contributions welcome! Please follow the coding standards and submit PRs.

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Arc Documentation](https://docs.arc.network)
- [Smart Contract ABI](#) (Add your contract address)
- [Deployed Contract](#) (Will be added after deployment)

## 📧 Support

For support, reach out to support@arcpay.example or create an issue.

## 🎯 Roadmap

- [ ] Batch payment API
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Recurring payments
- [ ] Staking rewards
- [ ] DAO governance
- [ ] Multi-chain support

---

Built with ❤️ for Arc ecosystem
