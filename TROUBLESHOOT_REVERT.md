# 🔧 Transaction Revert - Troubleshooting Guide

## ❌ Error You Got
```
Transaction execution reverted (status: 0)
```

This means the contract rejected your transaction. Let's figure out why!

---

## ✅ Step 1: Check Your USDC Balance

**This is the most likely issue!**

1. Go to: https://testnet.arcscan.app
2. Search for your wallet: `0xB055600E0Da3f2d629B8874f1Be95c2568524591`
3. Look for USDC token balance
4. If it shows 0, **you don't have USDC!**

### Get USDC from Faucet:
1. Go: https://faucet.circle.com
2. Connect wallet
3. Select: **Arc Testnet**
4. Click: **Get 10 USDC**
5. Wait ~60 seconds
6. Refresh https://testnet.arcscan.app to verify

---

## ✅ Step 2: Check Your Arc Testnet ETH Balance

The transaction needs ETH for gas fees!

1. On same block explorer page (from Step 1)
2. Look for **ARC** or **ETH** balance
3. If 0, you need gas!

### Get Arc Testnet ETH:
1. Same faucet: https://faucet.circle.com
2. Or request in Circle Discord

---

## ✅ Step 3: Verify Contract Setup

Make sure the contract is correctly configured:

1. Go: https://testnet.arcscan.app
2. Search: `0x072326C6a2194FE42Ed29Bc789F044934277E173`
3. Click **"Contract"** tab
4. Look for green checkmark ✅ (means contract deployed)
5. Under "Read Contract", call `getSupportedTokens()`
6. Should return: `0x3600000000000000000000000000000000000000` (the USDC address)

---

## ✅ Step 4: Check Frontend Environment Variables

Make sure your frontend is using correct addresses!

**File:** `frontend/.env.local`

Should have:
```
NEXT_PUBLIC_ARC_USDC_ADDRESS=0x3600000000000000000000000000000000000000
NEXT_PUBLIC_ARC_CONTRACT_ADDRESS=0x072326C6a2194FE42Ed29Bc789F044934277E173
```

**If you changed this, restart your frontend:**
```bash
# Stop the dev server (Ctrl+C)
# Then restart:
cd frontend
npm run dev
```

---

## ✅ Step 5: Check Approval Settings

The transaction flow has 2 steps:

**Step 1: Approve USDC spending**
- This tells the USDC contract: "Allow our payment contract to spend X USDC"
- You should see this first MetaMask popup

**Step 2: Initiate Payment**
- This calls the payment contract to transfer USDC

**If approval fails:**
- Make sure you have USDC balance (Step 1 above)
- Make sure you have enough ARC for gas
- The amount must be valid

---

## 🔍 Common Issues & Fixes

### Issue 1: "Insufficient balance"
**Cause:** You don't have USDC
**Fix:** Get USDC from faucet (Step 1 above)

### Issue 2: "Execution reverted" after approval
**Cause:** Contract rejected payment
**Fix:** Could be several things:
1. Amount too low (minimum is 10 USDC)
2. Amount too high (maximum is 100,000 USDC)
3. Recipient address is invalid
4. Token not registered (but we fixed this in deployment)

### Issue 3: "Transaction failed with no reason"
**Cause:** Usually insufficient gas
**Fix:** Get more Arc testnet ETH from faucet

### Issue 4: "Network Error"
**Cause:** Wrong network in MetaMask
**Fix:** Make sure MetaMask shows "Arc Testnet" (Chain 5042002)

---

## 🧪 Simple Test (Before Full Payment)

Before trying the full payment form, test on block explorer:

1. Go: https://testnet.arcscan.app
2. Find USDC contract: `0x3600000000000000000000000000000000000000`
3. Click "Write Contract"
4. Connect wallet
5. Call `balanceOf` with your address
6. If it returns > 0, you have USDC ✅

---

## 📋 Checklist Before Retry

- [ ] USDC balance > 0 (check on block explorer)
- [ ] ARC/ETH balance > 0 (for gas)
- [ ] MetaMask connected to Arc Testnet (5042002)
- [ ] Frontend restarted after env changes
- [ ] Contract verified on block explorer
- [ ] Payment amount between 10-100,000 USDC
- [ ] Recipient address is valid (0x...)

---

## 🆘 Still Not Working?

If everything above checks out but still failing, the contract call is being rejected for a specific reason. To debug:

1. Go to the failing transaction on block explorer
2. Look at "Input" data - this shows what was sent
3. Look at "Logs" - this shows what the contract returned
4. If no logs, the transaction reverted at contract level

**Share the transaction hash and I can help decode what went wrong!**

---

## ✨ Quick Next Steps

1. **Verify USDC balance** (this is 95% of failures)
2. **Verify ARC/ETH balance**
3. **Restart frontend**
4. **Try payment again**

Once you confirm these, try the payment flow again. Let me know if you get a specific error message and I can help! 🚀
