# ⚡ Quick Start - Test Your Contract NOW

## 1️⃣ Get Testnet USDC (2 min)

```
1. Go: https://faucet.circle.com
2. Connect wallet: 0xB055600E0Da3f2d629B8874f1Be95c2568524591
3. Select: Arc Testnet
4. Click: Get 10 USDC
5. Wait: ~30 seconds
```

**Verify:** https://testnet.arcscan.app → Search your wallet → Check USDC balance

---

## 2️⃣ Start Frontend (1 min)

```bash
cd C:\Users\johns\Projects\arc-cross-border-payments\frontend
npm run dev
```

Open: http://localhost:3000

---

## 3️⃣ Connect Wallet (1 min)

```
1. Click "Connect Wallet"
2. Select MetaMask
3. Approve connection
4. ✅ Should show your address in header
```

**⚠️ Make sure MetaMask is on Arc Testnet (5042002)**

---

## 4️⃣ Send Test Payment (2 min)

```
Form Fields:
├─ Recipient: 0x0000000000000000000000000000000000000001 (test address)
├─ Amount: 1
├─ Recipient Country: US
├─ Sender Country: US
└─ Payment Method: Bank Transfer

Then:
1. Click "Send Payment"
2. Approve token (MetaMask popup)
3. Confirm transaction (MetaMask popup)
4. ✅ Wait for success message with Payment ID
```

---

## 5️⃣ Complete Payment as Admin (1 min)

```
1. Click "Admin Mode" button (bottom right)
2. Enter: admin123
3. Click "Admin Dashboard" tab
4. Find your payment
5. Click "Complete Payment"
6. Approve transaction
7. ✅ Payment marked as "Completed"
```

---

## 📊 Check Results

### In Frontend:
- ✅ Payment History tab shows your payment
- ✅ Status changes from "Pending" to "Completed"

### On Block Explorer:
- Go: https://testnet.arcscan.app
- Search contract: 0x072326C6a2194FE42Ed29Bc789F044934277E173
- See all transactions & events

---

## 🐛 Issues?

### Wallet won't connect?
→ Make sure Arc Testnet added to MetaMask:
- Chain ID: 5042002
- RPC: https://rpc.testnet.arc.network

### No USDC balance?
→ Wait 60 seconds for faucet to process

### Transaction fails?
→ Make sure you have Arc testnet ETH for gas fees (get from same faucet)

---

## ✨ Success Checklist

- [ ] Got 10 USDC from faucet
- [ ] Frontend runs on localhost:3000
- [ ] Wallet connected successfully
- [ ] Payment initiated (got Payment ID)
- [ ] Payment completed (status changed to "Completed")
- [ ] Payment visible in history

**You're ready! Start testing now! 🚀**
