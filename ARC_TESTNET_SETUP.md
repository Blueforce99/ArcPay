# 🌐 Arc Testnet Setup Guide

## Arc Network Overview

**Arc** is Circle's application-specific blockchain for payments and commerce.

| Property | Value |
|----------|-------|
| **Network Name** | Arc Testnet |
| **Chain ID** | 5042002 |
| **RPC URL** | https://rpc.testnet.arc.network |
| **Block Explorer** | https://testnet.arcscan.app |
| **Native Token** | ETH |
| **Currency** | USDC (Circle's USD Coin) |
| **Purpose** | Testing & Development |

---

## 🔧 Step 1: Add Arc Testnet to MetaMask

### Manual Addition:

1. Open **MetaMask**
2. Click network dropdown (top left)
3. Click **"Add a network"**
4. Click **"Add a network manually"** (bottom)
5. Fill in details:

   ```
   Network name: Arc Testnet
   New RPC URL: https://rpc.testnet.arc.network
   Chain ID: 5042002
   Currency symbol: ETH
   Block explorer URL: https://testnet.arcscan.app
   ```

6. Click **"Save"**
7. You should see "Arc Testnet" in your network dropdown

### Quick Link (if available):
- Visit: https://chainlist.org
- Search: "arc"
- Click "Add to MetaMask"

---

## 💰 Step 2: Get Testnet Funds

### Get USDC & ETH:

1. Go to: **https://faucet.circle.com**
2. **Ensure you're on Arc Testnet** in MetaMask
3. Click **"Connect Wallet"**
4. Select **MetaMask**
5. Approve connection in MetaMask
6. You'll see your address
7. Click **"Request USDC"**
   - You get: **10 USDC**
8. Wait ~30 seconds
9. Click **"Request ETH"** (if option available)
   - You get: **0.5 ETH** (for gas)

**✅ You now have USDC and ETH on Arc Testnet!**

### Verify in MetaMask:
1. Make sure you're on Arc Testnet
2. You should see your ETH balance
3. To see USDC balance:
   - Click **"Import tokens"** (or similar)
   - Add USDC: `0xA0D71B9877f44C744546D649147FfD63A7eE2D6D`
   - You'll see your USDC balance

---

## 🔗 Contract Addresses on Arc Testnet

**Reference:** https://docs.arc.network/arc/references/contract-addresses

### Important Addresses:

| Token | Address | Decimals |
|-------|---------|----------|
| **USDC** | `0xA0D71B9877f44C744546D649147FfD63A7eE2D6D` | 6 |
| **USDT** | TBD | 6 |
| **DAI** | TBD | 18 |

We're currently using **USDC only** for the cross-border platform.

---

## 🚀 Step 3: Deploy Your Contract on Arc Testnet

See **REMIX_DEPLOYMENT_GUIDE.md** for detailed instructions.

**Quick version:**
1. Go to: https://remix.ethereum.org
2. Create `CrossBorderPayments.sol`
3. Paste contract code
4. Compile (Solidity 0.8.20)
5. Deploy to Arc Testnet via MetaMask
6. Save contract address

---

## 🔍 Step 4: Verify on ArcScan

### View Your Contract:

1. Go to: **https://testnet.arcscan.app**
2. Paste your contract address in search
3. You'll see:
   - Contract code
   - Transactions
   - Events
   - Account balance

### Verify Source Code (Optional):
1. On ArcScan, go to "Contract"
2. Scroll down to "Contract Creator"
3. Click **"Verify & Publish"**
4. Select: **Solidity (Single File)**
5. Compiler Version: **0.8.20**
6. Optimization: **Yes (200 runs)**
7. Paste contract code
8. Click **"Verify"**

---

## 🧪 Testing Transactions

### Send USDC via MetaMask:

1. Open MetaMask
2. Make sure Arc Testnet is selected
3. Click **"Send"**
4. Paste recipient address
5. Choose **"Select token"** → **USDC**
6. Enter amount (e.g., 1 USDC)
7. Review gas fee
8. Click **"Next"**
9. Click **"Confirm"**
10. Wait for confirmation (~10-30 seconds)

### View Transaction:
1. Go to ArcScan: https://testnet.arcscan.app
2. Paste your tx hash
3. You'll see:
   - From/To addresses
   - Amount
   - Gas used
   - Status (success/failed)
   - Timestamp

---

## 📊 Faucet Rate Limits

**Circle Faucet Rules:**
- USDC: 10 per request
- ETH: 0.5 per request
- Rate limit: Usually 1 request per day per wallet
- Reset: Daily at ~00:00 UTC

If rate-limited:
- Wait until next day, or
- Use a different wallet address

---

## 🛠️ Common Tasks

### Add USDC Token to MetaMask:
1. Click **"Import tokens"** (in Assets tab)
2. Paste: `0xA0D71B9877f44C744546D649147FfD63A7eE2D6D`
3. Click **"Add"**
4. You'll see USDC balance

### Check Gas Fees:
- Usually very low on testnet
- ~0.00001 ETH per transaction
- Your 0.5 ETH test tokens will last a LONG time

### View Account on ArcScan:
1. Go to: https://testnet.arcscan.app
2. Paste your address
3. See all your transactions, tokens, balance

---

## ⚠️ Important Notes

### Testnet is NOT Mainnet:
- All tokens are **FAKE** (test only)
- All transactions are **PRACTICE**
- **NO REAL VALUE** - testnet and mainnet are separate
- Don't confuse testnet USDC with real USDC

### Security:
- Never share your private key
- Don't send mainnet funds to testnet addresses
- Keep MetaMask securely backed up
- Use testnet for testing only

### Differences from Mainnet:
- Much faster (no real validators)
- Free/cheap gas fees
- Easy to get test tokens
- Resets/wipes periodically
- For development only

---

## 🔄 Switching Networks

### In MetaMask:
1. Click network dropdown (top left, next to account)
2. Select **"Arc Testnet"**
3. You're now on testnet
4. Repeat to switch back to mainnet or other networks

### Common Networks to Add:
- Ethereum Mainnet (1)
- Polygon/Matic (137)
- Arbitrum (42161)
- Optimism (10)
- Arc Testnet (5042002) ← Our network!

---

## 🎯 Checklist: You're Ready When...

- [ ] Arc Testnet added to MetaMask
- [ ] Switched to Arc Testnet network
- [ ] Have 10+ USDC in wallet
- [ ] Have 0.1+ ETH in wallet
- [ ] Can see USDC token in MetaMask
- [ ] Have contract address from deployment
- [ ] Can view contract on ArcScan
- [ ] Can view your transactions on ArcScan
- [ ] Understand testnet ≠ mainnet

---

## 🚀 Next Steps

1. ✅ **Setup MetaMask** with Arc Testnet
2. ✅ **Get Test Funds** from Circle faucet
3. ✅ **Deploy Contract** using Remix
4. ✅ **Test Transactions** on ArcScan
5. ✅ **Setup Frontend** with contract address
6. ✅ **Test Payment Flow** on your platform

---

## 📞 Help & Resources

| Resource | Link |
|----------|------|
| **Arc Docs** | https://docs.arc.network |
| **ArcScan Explorer** | https://testnet.arcscan.app |
| **Circle Faucet** | https://faucet.circle.com |
| **Remix IDE** | https://remix.ethereum.org |
| **MetaMask** | https://metamask.io |

---

## ❓ FAQ

**Q: Why do I need testnet?**
A: To test your dApp without spending real money.

**Q: Can I use testnet money on mainnet?**
A: No, testnet tokens have zero value.

**Q: What if I run out of test tokens?**
A: Request more from the faucet (daily limit).

**Q: How do I get mainnet funds?**
A: Through exchanges, bridges, or centralized services.

**Q: Can testnet be hacked?**
A: It's a test network, hacking has no real consequence.

**Q: What's the difference between testnet and mainnet?**
A: Mainnet is real money, testnet is fake.

---

**Arc Testnet Setup Complete! 🎉**

Next: Follow **QUICK_START.md** or **REMIX_DEPLOYMENT_GUIDE.md**
