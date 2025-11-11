# Diagnostic Checklist for Arc Cross-Border Payments

## Step 1: Verify Dependencies
```bash
cd C:\Users\johns\Projects\arc-cross-border-payments
npm install
cd frontend
npm install
cd ..
```

## Step 2: Check if Next.js is working
```bash
cd frontend
npm run dev
```

**EXPECTED OUTPUT:**
```
> arc-cross-border-frontend@1.0.0 dev
> next dev

  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Environments: .env

 ✓ Ready in 2.3s
```

If you DON'T see "Ready in X.Xs", something is wrong.

## Step 3: Browser Check
1. Go to `http://localhost:3000`
2. Open DevTools (F12)
3. Go to "Console" tab
4. Take a screenshot of any errors
5. Go to "Network" tab
6. Refresh page
7. Look for failed requests (red X)

## Step 4: Check Rendered Content
- Do you see the Header with "Arc Pay" logo?
- Do you see "Connect Wallet" button?
- When you click "Connect Wallet", does a modal pop up?

## Step 5: If SendPayment not showing
Run in browser console:
```javascript
// This will tell us if React found the component
window.__REACT_DEVTOOLS_GLOBAL_HOOK__
```

## Step 6: Check File System
```bash
dir "C:\Users\johns\Projects\arc-cross-border-payments\frontend\src\components\"
```

Should list:
- Header.tsx
- HeroSection.tsx
- PaymentHistory.tsx
- SendPayment.tsx
- StatsCards.tsx

If any are missing, that's the problem.

## Common Issues

### Issue: "npm: command not found"
**Solution:** Node.js not installed. Download from https://nodejs.org/

### Issue: "ENOENT: no such file or directory"
**Solution:** Run `npm install` in both root and frontend directories

### Issue: Page stays blank forever
**Solution:** Check terminal for compile errors. Look for red text with "error" in it.

### Issue: Components not rendering
**Solution:** Check browser console (F12 → Console) for React errors
