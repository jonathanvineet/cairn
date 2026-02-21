# WalletConnect Troubleshooting Guide

## Common Connection Issues

### "Failed to establish session with wallet"

This error occurs when the wallet connection doesn't complete successfully. Here are the steps to resolve it:

#### Option 1: Using HashPack Wallet (Recommended for Testing)

1. **Install HashPack**
   - Download from [hashpack.app](https://www.hashpack.app/)
   - Available as browser extension (Chrome, Firefox, Brave, Edge)
   - Also available as mobile app (iOS, Android)

2. **Create/Import Account**
   - Open HashPack
   - Create a new wallet or import existing one
   - **Important:** Switch to TESTNET in HashPack settings

3. **Get Test HBAR**
   - Go to [portal.hedera.com](https://portal.hedera.com)
   - Create a testnet account
   - Get free test HBAR from the faucet

4. **Connect to App**
   - Click "Connect Hedera Wallet" in the app
   - Scan the QR code with HashPack mobile OR click the wallet icon if using browser extension
   - Approve the connection in HashPack
   - Wait for confirmation (may take a few seconds)

#### Option 2: Using Kabila Wallet

1. Download Kabila mobile app
2. Create account and switch to Testnet
3. Scan QR code from the app
4. Approve connection

#### Option 3: Using Dropp Wallet

1. Install Dropp browser extension
2. Set network to Testnet
3. Connect when prompted by the app

### Network Mismatch

**Error:** "No Hedera accounts found in session"

**Solution:** Ensure your wallet is on the same network as the app

- App is configured for: **Testnet**
- In your wallet settings, switch to **Testnet** (not Mainnet)

### WalletConnect Project ID Issues

**Error:** "Invalid Project ID" or connection fails immediately

**Solution:** Verify your WalletConnect Project ID

```bash
# Check .env file
cat .env
```

Should contain:
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Get a free Project ID from [cloud.walletconnect.com](https://cloud.walletconnect.com)

### Modal Doesn't Appear

**Symptoms:** Click "Connect Wallet" but nothing happens

**Solutions:**

1. **Clear Browser Cache**
   ```
   - Chrome/Edge: Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
   - Clear cached images and files
   - Restart browser
   ```

2. **Check Console for Errors**
   - Open browser DevTools (F12)
   - Look for errors in Console tab
   - Share any error messages for help

3. **Disable Ad Blockers**
   - Some ad blockers interfere with WalletConnect
   - Try disabling temporarily

### Session Timeout

**Error:** Connection works but quickly disconnects

**Solution:** This is usually a wallet app issue

- Close and reopen wallet app
- Ensure wallet app is up to date
- Try a different wallet (HashPack is most reliable)

## Debugging Steps

### 1. Check Your Setup

```bash
# Verify dependencies are installed
npm install

# Check for any missing packages
npm list @hashgraph/hedera-wallet-connect @hiero-ledger/sdk @walletconnect/modal
```

### 2. Enable Debug Logging

Update `lib/walletConfig.ts`:

```typescript
await dAppConnector.init({ logger: "debug" }); // Change from "error" to "debug"
```

This will show detailed logs in the browser console.

### 3. Test with Different Wallets

Try multiple wallets to isolate the issue:
- HashPack (usually most reliable)
- Kabila
- Dropp

### 4. Verify Environment Variables

```bash
# Print environment variables (check they're loaded)
echo $NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
echo $NEXT_PUBLIC_APP_URL
```

If empty, restart your dev server after setting them in `.env`

### 5. Check Network Tab

In browser DevTools:
- Go to Network tab
- Filter by "wss" (WebSocket)
- You should see WalletConnect websocket connections
- If they fail immediately, check your Project ID

## Still Having Issues?

### Check These Common Mistakes

- ❌ Wallet is on Mainnet (app expects Testnet)
- ❌ WalletConnect Project ID is missing or invalid
- ❌ Browser cache is causing conflicts
- ❌ Wallet app is outdated
- ❌ Firewall blocking WebSocket connections
- ❌ Using Turbopack instead of webpack (should be disabled)

### Get More Help

1. Check browser console for errors
2. Check logs with debug mode enabled
3. Verify all environment variables are set
4. Try a different wallet app
5. Try a different browser

### Test Page

Visit the test page to debug step-by-step:

```
http://localhost:3000/test-hedera
```

This page shows detailed connection status and error messages.

## Working Configuration Example

```typescript
// ✅ lib/walletConfig.ts
const metadata = {
  name: "Cairn - Hedera Drone Network",
  description: "Decentralized drone operations on Hedera",
  url: "http://localhost:3000", // Must match your actual URL
  icons: ["https://avatars.githubusercontent.com/u/31002956"],
}

// ✅ .env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=abc123...
NEXT_PUBLIC_APP_URL=http://localhost:3000

// ✅ Wallet Settings
Network: Testnet
Account: 0.0.xxxx (with test HBAR)
```

## Quick Fix Checklist

- [ ] Wallet is on **Testnet**
- [ ] WalletConnect Project ID is set in `.env`
- [ ] Dev server restarted after `.env` changes
- [ ] Browser cache cleared
- [ ] Using HashPack or another Hedera-compatible wallet
- [ ] Wallet app is up to date
- [ ] No ad blockers interfering
- [ ] Running `npm run dev` (not with Turbopack)
