# Environment Setup Guide

## For Smart Contracts

Create `.env` in the root directory:

```
# Arc Network RPC Endpoints
ARC_TESTNET_RPC=https://testnet.arc.network/rpc
ARC_MAINNET_RPC=https://mainnet.arc.network/rpc

# Private Key for Deployment
# IMPORTANT: Never commit this to git!
PRIVATE_KEY=your_private_key_here_without_0x_prefix

# Optional: Etherscan API key for verification
ETHERSCAN_API_KEY=your_etherscan_key

# Optional: Gas price settings
GAS_PRICE=auto
```

## For Frontend

Create `frontend/.env.local`:

```
# Arc Contract Address (after deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

# Arc Network
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_CHAIN_ID=2048

# Token Addresses on Arc Testnet
NEXT_PUBLIC_USDC_ADDRESS=0x...
NEXT_PUBLIC_USDT_ADDRESS=0x...
NEXT_PUBLIC_DAI_ADDRESS=0x...

# RPC Endpoint (if using direct calls)
NEXT_PUBLIC_RPC_URL=https://testnet.arc.network/rpc

# API Endpoints (optional, for exchange rates, etc.)
NEXT_PUBLIC_COINGECKO_API=https://api.coingecko.com/api/v3
NEXT_PUBLIC_API_URL=https://api.arcpay.example
```

## Getting Testnet Funds

1. Visit Arc testnet faucet: https://faucet.arc.network
2. Enter your wallet address
3. Request testnet ETH
4. Wait for confirmation

## Deploying Smart Contract

```bash
# From root directory
npm install
npm run deploy:testnet

# Output will contain:
# - Contract Address
# - Network details
# - Supported tokens
```

Copy the contract address and update `.env.local` in the frontend.

## Running Locally

```bash
# Terminal 1: Smart contract tests/development
npm test
npm run compile

# Terminal 2: Frontend development
cd frontend
npm run dev

# Visit http://localhost:3000
```

## Deployment Checklist

- [ ] `.env` configured with private key
- [ ] Smart contract deployed to Arc testnet
- [ ] Contract address updated in `.env.local`
- [ ] Token addresses added to `.env.local`
- [ ] Frontend builds without errors
- [ ] Wallet connection working
- [ ] Payment flow tested
- [ ] Ready for production deployment

## Production Deployment (Vercel)

```bash
cd frontend

# Set up environment variables in Vercel dashboard
# https://vercel.com/dashboard

# Deploy
vercel --prod
```

## Troubleshooting

### "Network not found"
- Check Arc RPC endpoint is correct
- Verify chain ID is 2048
- Test RPC with: `curl <RPC_URL>`

### "Contract not found"
- Ensure deployment completed successfully
- Verify contract address in `.env.local`
- Check explorer for contract at that address

### "Insufficient balance"
- Request more testnet ETH from faucet
- Check address is correct
- Wait for testnet faucet confirmation

### "Token not supported"
- Update token addresses in `.env.local`
- Verify tokens exist on Arc testnet
- Run `setExchangeRate()` on contract for new tokens
