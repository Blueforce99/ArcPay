# ✅ New Contract Deployment - Minimum 0.1 USDC

## What Changed

Updated your contract to use **0.1 USDC minimum** instead of 10 USDC:

- ✅ `minPaymentAmount = 1e5` (0.1 USDC with 6 decimals)
- ✅ Frontend validation updated
- ✅ Debug test updated to use 0.1 USDC

---

## 🚀 Deploy New Contract in Remix

### Step 1: Go to Remix
https://remix.ethereum.org

### Step 2: Create New File
1. Left sidebar → "File Explorer"
2. Click "New File"
3. Name it: `CrossBorderPaymentsV2.sol`
4. Copy your updated contract code into it

**Get updated contract from:**
`C:\Users\johns\Projects\arc-cross-border-payments\contracts\CrossBorderPayments.sol`

### Step 3: Compile
1. Click "Solidity Compiler" icon (left)
2. Select version: **0.8.20**
3. Click "Compile CrossBorderPaymentsV2.sol"
4. Should show ✅ green checkmark

### Step 4: Deploy
1. Click "Deploy & Run Transactions" icon
2. Environment: **Injected Provider - MetaMask**
3. Make sure MetaMask shows **Arc Testnet**
4. Contract: **CrossBorderPayments** (or CrossBorderPaymentsV2)
5. Enter parameters:
   ```
   _feeCollector: 0xB055600E0Da3f2d629B8874f1Be95c2568524591
   _usdcToken:    0x3600000000000000000000000000000000000000
   ```
6. Click **Deploy**
7. Approve in MetaMask

### Step 5: Save New Contract Address
After deployment, you'll get a new contract address. Copy it.

Example format: `0x...` (40 characters + 0x)

---

## Step 6: Update Frontend

Update your `.env.local` file with the NEW contract address:

**File:** `frontend/.env.local`

Change:
```
NEXT_PUBLIC_ARC_CONTRACT_ADDRESS=0x072326C6a2194FE42Ed29Bc789F044934277E173
```

To:
```
NEXT_PUBLIC_ARC_CONTRACT_ADDRESS=[YOUR_NEW_CONTRACT_ADDRESS]
```

---

## Step 7: Restart Frontend

```bash
# Stop current server (Ctrl+C)
cd C:\Users\johns\Projects\arc-cross-border-payments\frontend
npm run dev
```

---

## Step 8: Test Payment

1. Open http://localhost:3000
2. Connect wallet
3. Click **Debug** tab
4. Click "Run Test Payment"
5. Should send **0.1 USDC** and work! ✅

---

## ✨ Result

Now you can:
- ✅ Test multiple times with your USDC balance
- ✅ Send 0.1 USDC per payment
- ✅ With 11.3 USDC, you can test ~100+ times!

---

## 📋 Quick Checklist

- [ ] Updated contract file (minPaymentAmount = 1e5)
- [ ] Created new file in Remix
- [ ] Compiled with v0.8.20 ✅
- [ ] Deployed with correct parameters
- [ ] Got new contract address
- [ ] Updated `.env.local` with new address
- [ ] Restarted frontend
- [ ] Tested in Debug tab

**Let me know the new contract address once you deploy!** 🚀
