# ✅ Register USDC - Using Remix

Since the npm command didn't work, let's use **Remix IDE** which is simpler and faster!

---

## Step 1: Open Remix

Go to: https://remix.ethereum.org

---

## Step 2: Connect to Your Contract

1. Click the **"Deploy & Run Transactions"** icon (🚀, left sidebar)
2. Change **Environment** to: **"Injected Provider - MetaMask"**
3. MetaMask will popup - **Approve connection**
4. Make sure MetaMask shows **"Arc Testnet"** (5042002)

---

## Step 3: Load Your Contract

In the "Deploy & Run Transactions" panel:

1. At the bottom, there's a section: **"Load contract from Address"**
2. Paste your contract address: `0x072326C6a2194FE42Ed29Bc789F044934277E173`
3. Select **"CrossBorderPayments"** from the ABI dropdown
4. Click **"At Address"**

Now you should see your deployed contract loaded!

---

## Step 4: Call setExchangeRate

In the contract panel, you'll see all functions. Find `setExchangeRate`:

1. Click the arrow to expand it
2. You'll see two input fields:
   - **_token**: 
     ```
     0x3600000000000000000000000000000000000000
     ```
   - **_rate**: 
     ```
     1000000
     ```
3. Fill in both
4. Click the **orange "setExchangeRate" button**
5. MetaMask popup will show - **Approve the transaction**

---

## Step 5: Verify It Worked

After the transaction confirms:

1. In the same contract panel, find `getSupportedTokens` (read function)
2. Click the blue **"getSupportedTokens"** button
3. You should see the result:
   ```
   [
     "0x3600000000000000000000000000000000000000"
   ]
   ```

If you see that address, USDC is now registered! ✅

---

## Step 6: Test Payment

Now go back to your app:

1. http://localhost:3000
2. Click **Debug** tab
3. Click **"Run Test Payment"**
4. Should work now! 🎉

---

## Visual Guide

```
Remix IDE
├─ Deploy & Run Transactions (🚀)
├─ Environment: "Injected Provider - MetaMask"
├─ [Load contract from Address]
│  ├─ Address: 0x072326C6a2194FE42Ed29Bc789F044934277E173
│  └─ Click "At Address"
├─ Your contract functions appear
├─ Find "setExchangeRate"
├─ _token: 0x3600000000000000000000000000000000000000
├─ _rate: 1000000
├─ Click orange button
└─ ✅ Confirm in MetaMask
```

---

**Let me know once you do this and the payment works!** 🚀
