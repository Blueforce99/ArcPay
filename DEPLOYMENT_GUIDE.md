# 🚀 Deployment Guide - Arc Cross-Border Payments

## Quick Start for Developers

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/arc-cross-border-payments.git
cd arc-cross-border-payments
```

### 2. Install Dependencies
```bash
npm install
cd frontend && npm install && cd ..
```

### 3. Configure Environment

Copy the example env file:
```bash
cp .env.example .env.local
cd frontend
cp ../.env.example .env.local
```

Update `frontend/.env.local` with your contract address:
```
NEXT_PUBLIC_ARC_CHAIN_ID=5042002
NEXT_PUBLIC_ARC_RPC_URL=https://rpc.testnet.arc.network
NEXT_PUBLIC_ARC_CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS_HERE
NEXT_PUBLIC_ARC_USDC_ADDRESS=0x3600000000000000000000000000000000000000
```

### 4. Deploy Smart Contract

**Option A: Using Remix IDE (Easiest)**
1. Go to https://remix.ethereum.org
2. Create new file: `CrossBorderPayments.sol`
3. Paste contract from `contracts/CrossBorderPayments.sol`
4. Compile with v0.8.20
5. Deploy to Arc Testnet with:
   - `_feeCollector`: Your wallet address
   - `_usdcToken`: `0x3600000000000000000000000000000000000000`
6. Copy the contract address

**Option B: Using Hardhat**
```bash
# Configure Arc network in hardhat.config.js
npx hardhat run scripts/deploy.js --network arc
```

### 5. Run Frontend
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000`

---

## Production Deployment

### Frontend Deployment

**Vercel (Recommended)**
```bash
npm install -g vercel
vercel
# Follow the prompts
```

**Docker**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Smart Contract on Arc Mainnet

Update `hardhat.config.js`:
```javascript
networks: {
  arc: {
    url: 'https://rpc.arc.network',
    chainId: 5042003,
    accounts: [process.env.PRIVATE_KEY]
  }
}
```

Deploy:
```bash
npx hardhat run scripts/deploy.js --network arc
```

---

## Configuration

### Environment Variables

**Required:**
- `NEXT_PUBLIC_ARC_CONTRACT_ADDRESS` - Your deployed contract
- `NEXT_PUBLIC_ARC_USDC_ADDRESS` - USDC token address
- `NEXT_PUBLIC_ARC_CHAIN_ID` - Chain ID (5042002 for testnet)
- `NEXT_PUBLIC_ARC_RPC_URL` - RPC endpoint

**Optional:**
- `NEXT_PUBLIC_ADMIN_PASSWORD` - Admin dashboard password
- `NEXT_PUBLIC_TESTNET_MODE` - Enable testnet features

### Smart Contract Configuration

**Constructor Parameters:**
```solidity
CrossBorderPayments(
  address _feeCollector,  // Your wallet for fee collection
  address _usdcToken      // USDC token address
)
```

**Post-Deployment Setup:**

1. Register additional tokens (if needed):
```solidity
setExchangeRate(tokenAddress, rate)
```

2. Update fee percentage (optional):
```solidity
setFeePercentage(newPercentage)
```

3. Set payment limits:
```solidity
setPaymentLimits(minAmount, maxAmount)
```

---

## Testing

### Local Testing
```bash
# Test smart contract
npx hardhat test

# Test frontend
cd frontend
npm run test
```

### Testnet Testing
1. Get test USDC from faucet: https://faucet.circle.com
2. Connect wallet to Arc Testnet (Chain ID: 5042002)
3. Send test payments through the UI

---

## Security Checklist

Before going to production:

- [ ] Contract audited by security firm
- [ ] Environment variables secured (use secrets manager)
- [ ] Rate limiting implemented
- [ ] Admin functions protected
- [ ] Error handling comprehensive
- [ ] Monitoring and logging set up
- [ ] Disaster recovery plan ready
- [ ] Terms of service & privacy policy
- [ ] Insurance coverage evaluated

---

## Monitoring & Maintenance

### Health Checks
```bash
# Monitor contract transactions
curl https://testnet.arcscan.app/api/v1/contract/YOUR_CONTRACT/transactions

# Monitor frontend uptime
# Use monitoring service like Uptime Robot
```

### Common Issues

**Issue: "Token not supported"**
- Solution: Register token with `setExchangeRate()`

**Issue: "Insufficient balance"**
- Solution: User needs more USDC in wallet

**Issue: "Network switched"**
- Solution: Ensure wallet is on Arc Testnet (5042002)

---

## Support & Community

- **Documentation**: https://docs.arc.network
- **Discord**: https://discord.gg/arc
- **Twitter**: https://twitter.com/arcnetwork
- **Issues**: GitHub Issues tab

---

## License

MIT License - See LICENSE file

---

**Ready to deploy? Let's build the future of cross-border payments! 🚀**
