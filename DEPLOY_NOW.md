# 🚀 Deploy to Arc Testnet - Step by Step (Remix)

## ✅ You've Compiled Successfully!

Now let's deploy to Arc Testnet.

---

## 📋 Prerequisites Check

Before deploying, make sure you have:

- ✅ MetaMask installed
- ✅ Arc Testnet added to MetaMask
- ✅ Some testnet ETH (for gas) - Request from https://faucet.circle.com
- ✅ Contract compiled in Remix

---

## 🚀 Deploy in Remix (4 Simple Steps)

### Step 1: Go to Deploy Tab

In Remix (left sidebar):
1. Click the **"Deploy & Run Transactions"** icon (rocket ship 🚀)
2. You should see a panel on the left

### Step 2: Select Environment

In the "Environment" dropdown, select:
- **"Injected Provider - MetaMask"**

This will:
- Connect to your MetaMask wallet
- Use whatever network you're currently on in MetaMask
- A MetaMask popup will appear asking to connect

**⚠️ IMPORTANT: Make sure MetaMask is set to "Arc Testnet" before clicking this!**

Check MetaMask (top left) shows: **"Arc Testnet"**

### Step 3: Verify Contract Selection

In the Remix panel, under "Contract" dropdown, make sure:
- **"CrossBorderPayments"** is selected

### Step 4: Enter Constructor Parameter

You'll see a field that says:
```
_feeCollector (address)
```

Enter your wallet address. You can use:
- Your current MetaMask wallet address
- OR any address you want to collect fees to

**To get your address:**
1. Click on your MetaMask wallet icon
2. Click the address to copy it
3. Paste into Remix

### Step 5: Click Deploy!

Click the orange **"Deploy"** button

This will:
1. Open MetaMask popup
2. Show gas fee estimate
3. You confirm the transaction
4. Contract deploys to Arc Testnet

---

## 📝 MetaMask Deployment Popup

When you click Deploy, MetaMask will show:

```
Method: constructor
From: 0x... (your address)
To: (contract creation)
Gas: ~2,000,000
Gas Price: auto

[Reject] [Confirm]
```

Click **"Confirm"** to deploy.

---

## ✅ Deployment Complete!

After confirmation (~30-60 seconds):

1. You'll see in Remix bottom panel:
   - ✅ "Creation of CrossBorderPayments pending..."
   - Then: ✅ "Creation of CrossBorderPayments successful"

2. A new section appears showing:
   - **Contract Address**: `0x...` (copy this!)
   - **Transaction Hash**: `0x...`

### 🎯 SAVE YOUR CONTRACT ADDRESS!

This is the most important thing - copy and save:
```
Contract Address: 0x________________________________________
```

You'll need this for the frontend!

---

## 🔍 Verify Deployment on ArcScan

1. Go to: https://testnet.arcscan.app
2. Paste your contract address in the search box
3. You should see:
   - ✅ Contract code
   - ✅ Transactions
   - ✅ Your deployment tx

---

## ⚙️ After Deployment - Setup Exchange Rate

Your contract is deployed, but you need to enable USDC first!

### In Remix (same panel):

1. Scroll down to find your deployed contract
2. Click to expand it
3. Find the function: **"setExchangeRate"**
4. Enter:
   - **Token**: `0xA0D71B9877f44C744546D649147FfD63A7eE2D6D` (USDC on Arc)
   - **Rate**: `10000` (1:1 exchange rate)
5. Click the button
6. Approve in MetaMask

This enables USDC payments in your contract.

---

## 📊 Deployment Checklist

- [ ] MetaMask connected to Arc Testnet
- [ ] Have testnet ETH for gas
- [ ] Contract compiled in Remix
- [ ] Environment set to "Injected Provider - MetaMask"
- [ ] CrossBorderPayments selected
- [ ] Fee collector address entered
- [ ] Deploy button clicked
- [ ] MetaMask popup confirmed
- [ ] Deployment successful ✅
- [ ] Contract address saved
- [ ] Verified on ArcScan
- [ ] Exchange rate set for USDC

---

## 🎯 Next Steps

After deployment:

1. **Copy contract address**
2. **Update frontend/.env.local** with:
   ```
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x... (your address)
   ```
3. **Run frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
4. **Test on http://localhost:3000**

---

## 🆘 Troubleshooting

### "MetaMask not connected"
- Make sure MetaMask is installed
- Click "Injected Provider - MetaMask" again
- Approve connection in MetaMask popup

### "Insufficient balance for gas"
- Go to: https://faucet.circle.com
- Request more testnet ETH
- Wait 1-2 minutes
- Try deploying again

### "Wrong network" error
- Check MetaMask shows "Arc Testnet" in top left
- If not, add it:
  - Network: Arc Testnet
  - RPC: https://rpc.testnet.arc.network
  - Chain ID: 5042002

### "Gas estimation failed"
- Make sure you have testnet ETH
- Reduce gas manually if needed
- Check contract compiles with no warnings

### Deployment stuck
- Wait 2-3 minutes
- Check ArcScan for pending tx
- Try refreshing Remix
- Check MetaMask transaction history

---

## 🔗 Important Links

- **ArcScan Explorer**: https://testnet.arcscan.app
- **Faucet (get ETH/USDC)**: https://faucet.circle.com
- **Arc RPC**: https://rpc.testnet.arc.network
- **Remix IDE**: https://remix.ethereum.org

---

## ✨ You're Done!

Once deployment is successful:
- ✅ Smart contract is live on Arc Testnet
- ✅ Ready for frontend integration
- ✅ Ready to test payments
- ✅ Ready to launch!

**Save your contract address and move to frontend setup!** 🎉

---

## 📞 Need Help?

If something goes wrong:

1. Check you're on Arc Testnet in MetaMask
2. Check you have testnet ETH
3. Check contract compiles
4. Check the error message in Remix
5. Try refreshing Remix page
6. Check MetaMask is connected

Still stuck? Check **REMIX_DEPLOYMENT_GUIDE.md** for more detailed help.
