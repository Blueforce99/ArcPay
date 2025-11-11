# ⚡ Arc Cross-Border Payments - Quick Start Guide

## 🎯 Your Arc Testnet Details

```
Network:          Arc Testnet
RPC URL:          https://rpc.testnet.arc.network
Chain ID:         5042002
Block Explorer:   https://testnet.arcscan.app/tx
Currency:         USDC (USD Coin)
Faucet:           https://faucet.circle.com
```

---

## 🚀 5-Minute Quick Start

### Step 1: Get Testnet USDC & ETH (2 minutes)

1. Go to: **https://faucet.circle.com**
2. Connect your wallet (MetaMask)
3. Make sure you're on **Arc Testnet (Chain ID: 5042002)**
   - If not in your wallet, add it manually:
     - Network Name: Arc Testnet
     - RPC: https://rpc.testnet.arc.network
     - Chain ID: 5042002
     - Currency: ETH
4. Request ETH and USDC
5. Wait ~1-2 minutes for confirmation

**✅ Now you have USDC and ETH on Arc Testnet!**

---

### Step 2: Deploy Smart Contract (2 minutes)

**Using Remix IDE (No local setup needed):**

1. Go to: **https://remix.ethereum.org**
2. Create new file: `CrossBorderPayments.sol`
3. Copy the contract code from: `REMIX_DEPLOYMENT_GUIDE.md`
4. In left sidebar, click **Solidity Compiler** icon
5. Select version **0.8.20** and click **Compile**
6. Click **Deploy & Run Transactions** icon
7. Under "Environment", select **Injected Web3**
   - MetaMask will pop up, approve connection
8. In "Deploy" section, enter your wallet address as fee collector
9. Click orange **"Deploy"** button
10. Approve in MetaMask
11. **Copy the contract address** from deployment receipt

**✅ Contract is now live on Arc Testnet!**

---

### Step 3: Setup Frontend (1 minute)

Update `frontend/.env.local`:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0x<your_deployed_contract_address>
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_CHAIN_ID=5042002
NEXT_PUBLIC_USDC_ADDRESS=0xA0D71B9877f44C744546D649147FfD63A7eE2D6D
NEXT_PUBLIC_RPC_URL=https://rpc.testnet.arc.network
```

**✅ Frontend configured!**

---

### Step 4: Run Locally (1 minute)

```bash
cd frontend
npm install  # if not already done
npm run dev
```

Visit: **http://localhost:3000**

**✅ Ready to test!**

---

## 🧪 Testing the Platform

### Test User Flow:

1. **Connect Wallet**
   - Click "Connect Wallet"
   - Select MetaMask
   - Approve connection
   - See your address in header

2. **Send Payment**
   - Fill in your name
   - Select recipient country
   - Enter recipient name & email
   - Choose payment method (Wallet recommended)
   - Enter recipient wallet address
   - Enter amount (e.g., 10 USDC)
   - Review and confirm
   - Approve token transfer in MetaMask
   - Approve payment in MetaMask

3. **View History**
   - Click "Payment History" tab
   - See your transaction
   - Click tx hash to view on explorer

---

## 📊 Testing Checklist

- [ ] Can connect wallet
- [ ] Can see balance
- [ ] Can initiate payment
- [ ] MetaMask approvals work
- [ ] Payment shows in history
- [ ] Can search history
- [ ] Mobile responsive
- [ ] Navigation works

---

## 🔗 Useful Links

| Purpose | Link |
|---------|------|
| **Get Test Tokens** | https://faucet.circle.com |
| **View Contract** | https://testnet.arcscan.app (paste address) |
| **Deploy Contract** | https://remix.ethereum.org |
| **View Transactions** | https://testnet.arcscan.app |
| **Add Network to Wallet** | Manual or use chainlist.org |

---

## 🛠️ Troubleshooting

### Issue: "Wrong network" error
**Solution:**
- Ensure MetaMask is set to Arc Testnet
- Add network manually if needed:
  - Name: Arc Testnet
  - RPC: https://rpc.testnet.arc.network
  - Chain ID: 5042002
  - Currency: ETH

### Issue: "Insufficient balance" for gas
**Solution:**
- Go to https://faucet.circle.com
- Request more ETH
- Wait 1-2 minutes
- Reload page

### Issue: "Token not supported" error
**Solution:**
- Make sure contract address is correct in `.env.local`
- USDC address should be: `0xA0D71B9877f44C744546D649147FfD63A7eE2D6D`
- Check contract has USDC exchange rate set

### Issue: MetaMask won't connect
**Solution:**
- Refresh page
- Clear browser cache
- Restart MetaMask
- Make sure you're on Arc Testnet
- Try different browser

---

## 📝 Setting Exchange Rates

After deployment, you need to enable USDC in your contract:

**Via Remix (Easy):**
1. In Remix, go to "Deploy & Run Transactions"
2. Click on your deployed contract
3. Find `setExchangeRate` function
4. Enter:
   - Token: `0xA0D71B9877f44C744546D649147FfD63A7eE2D6D` (USDC)
   - Rate: `10000` (1:1 exchange rate)
5. Click "Transact"
6. Approve in MetaMask

**Via Frontend (Soon):**
- Will be added to admin dashboard

---

## 🎨 White/Blue Theme

The UI uses Circle's white/blue color scheme:
- **Primary Blue**: #6495ff
- **Background**: White with blue gradient
- **Accent**: Circle's brand blue
- **Buttons**: Gradient blue

Fully responsive on:
- 📱 Mobile (iPhone, Android)
- 💻 Tablet (iPad, etc.)
- 🖥️ Desktop (Chrome, Firefox, Safari)

---

## 📈 Next Steps

### For Testing:
1. ✅ Deploy contract
2. ✅ Setup frontend
3. ✅ Test payment flow
4. ✅ Check history
5. ✅ Test mobile

### For Production:
1. 📋 Complete LAUNCH_CHECKLIST.md
2. 🚀 Deploy frontend to Vercel
3. 📊 Monitor transactions
4. 🛡️ Security review
5. 📢 Launch on Arc ecosystem

---

## 💡 Tips

- **Test Multiple Payments**: Try different amounts and countries
- **Check Explorer**: Visit testnet.arcscan.app to see your transactions
- **Mobile Testing**: Use DevTools (F12) to test responsiveness
- **Keep Contract Address**: You'll need it later for mainnet
- **Save Configuration**: Keep .env.local safe

---

## 🎉 You're All Set!

1. ✅ Testnet configured
2. ✅ Quick start steps clear
3. ✅ Deployment guide ready
4. ✅ Testing checklist prepared
5. ✅ All links provided

**Next: Follow the 5-minute quick start above! 🚀**

---

## 📞 Support

Issues?
- Check **REMIX_DEPLOYMENT_GUIDE.md** for detailed deployment
- Check **LAUNCH_CHECKLIST.md** for comprehensive checklist
- Check **ENV_SETUP.md** for configuration help
- Review contract code: `contracts/CrossBorderPayments.sol`

---

**Built for Arc Testnet with Circle's white/blue theme ✨**
