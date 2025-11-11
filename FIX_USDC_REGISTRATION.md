# 🔧 Fix: Register USDC in Contract

## The Problem

When you deployed the contract in Remix, **USDC was not registered** even though you passed the address to the constructor.

This is why you're getting: `"Token not supported"` error (reverted tx).

---

## The Solution: Register USDC Manually

### Method 1: Via Block Explorer (Easiest)

1. Go to: https://testnet.arcscan.app
2. Search for contract: `0x072326C6a2194FE42Ed29Bc789F044934277E173`
3. Click **"Contract"** tab
4. Click **"Write Contract"**
5. Connect your wallet
6. Find `setExchangeRate` function
7. Fill in:
   ```
   _token:  0x3600000000000000000000000000000000000000
   _rate:   1000000
   ```
8. Click **"Write"**
9. Approve in MetaMask

---

### Method 2: Via Hardhat Script

**Step 1: Make sure your hardhat config has Arc network:**

File: `hardhat.config.js`

Should have:
```javascript
networks: {
  arc: {
    url: 'https://rpc.testnet.arc.network',
    chainId: 5042002,
  }
}
```

**Step 2: Run this command:**

```bash
cd C:\Users\johns\Projects\arc-cross-border-payments
npx hardhat run scripts/verifyUSDARegistration.js --network arc
```

This will:
- Check if USDC is registered
- If not, automatically register it

---

## Verify It Worked

**After registering USDC:**

1. Go to: https://testnet.arcscan.app
2. Search contract: `0x072326C6a2194FE42Ed29Bc789F044934277E173`
3. Click "Read Contract"
4. Call `getSupportedTokens()`
5. Should see: `0x3600000000000000000000000000000000000000` in the list ✅

---

## Then Test Payment Again

After USDC is registered:

1. Go to http://localhost:3000
2. Click **Debug** tab
3. Click **"Run Test Payment"**
4. Should work now! ✅

---

## Why Did This Happen?

When deploying in Remix, the constructor parameters might not have been set correctly. The second parameter should be:

```
_usdcToken: 0x3600000000000000000000000000000000000000
```

If you didn't pass this, USDC wasn't auto-registered.

---

## Quick Fix (Recommended)

**Use Block Explorer method (Method 1) - it's fastest:**

1. Go to arcscan.app
2. Write the `setExchangeRate` function
3. Register USDC
4. Done! ✅

Then try the payment again!

Let me know once you've registered USDC and the payment test passes! 🚀
