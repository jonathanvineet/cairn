# Hedera Wallet Integration Guide

This project is configured to connect to Hedera testnet wallets using the WalletConnect protocol via the `@hashgraph/hedera-wallet-connect` library.

## Setup Instructions

### 1. Get a WalletConnect Project ID

1. Go to [WalletConnect Cloud Console](https://cloud.walletconnect.com)
2. Sign up or log in
3. Create a new project
4. Copy your Project ID

### 2. Configure Environment Variables

Create a `.env.local` file in the project root (copy from `.env.example`):

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Important:** The `NEXT_PUBLIC_` prefix makes these variables available in the browser. Never expose sensitive keys with this prefix.

### 3. Install Dependencies

```bash
npm install
```

## Supported Wallets

The following Hedera wallets support WalletConnect:

- **[HashPack](https://www.hashpack.app)** - Recommended
- **[Kabila](https://kabila.io)**
- **[Dropp](https://dropp.io)**

## Usage

### Basic Wallet Connection

The wallet connection UI is available in the header via the `<WalletConnect />` component.

```tsx
import { WalletConnect } from "@/components/WalletConnect";

export default function Header() {
  return (
    <header>
      <WalletConnect />
    </header>
  );
}
```

### Using Wallet in Components

Use the `useHederaWallet` hook to interact with the connected wallet:

```tsx
"use client";

import { useHederaWallet } from "@/lib/useHederaWallet";
import { TransferTransaction, Hbar, AccountId } from "@hiero-ledger/sdk";

export function TransferComponent() {
  const { connected, selectedAccount, signAndExecuteTransaction } =
    useHederaWallet();

  const handleTransfer = async () => {
    if (!connected || !selectedAccount) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      // Create transaction
      const transaction = new TransferTransaction()
        .addHbarTransfer(new AccountId(selectedAccount.id), new Hbar(-10))
        .addHbarTransfer(new AccountId("0.0.1000"), new Hbar(10))
        .setTransactionMemo("Transfer via Cairn");

      // Sign and execute
      const result = await signAndExecuteTransaction(transaction);
      console.log("Transaction ID:", result);
    } catch (error) {
      console.error("Transfer failed:", error);
    }
  };

  return (
    <button onClick={handleTransfer} disabled={!connected}>
      {connected ? "Transfer 10 HBAR" : "Connect Wallet"}
    </button>
  );
}
```

### Multi-Signature Transactions

For transactions requiring multiple signatures (e.g., wallet + backend):

```tsx
const { signTransaction } = useHederaWallet();

// Sign in wallet (doesn't execute)
const signedTx = await signTransaction(transaction);

// Send to backend for additional signature
const response = await fetch("/api/co-sign", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    signedTransaction: Buffer.from(signedTx.toBytes()).toString("base64"),
  }),
});

const result = await response.json();
// Backend returns fully signed transaction
```

## Architecture

### Files

- **`/lib/walletConfig.ts`** - DAppConnector initialization and configuration
- **`/lib/useHederaWallet.ts`** - Custom hook for wallet operations
- **`/stores/walletStore.ts`** - Zustand store for wallet state management
- **`/components/WalletConnect.tsx`** - UI component for wallet connection

### State Management

Wallet state is managed using Zustand:

```tsx
import { useWalletStore } from "@/stores/walletStore";

const { connected, selectedAccount, accounts, error } = useWalletStore();
```

## Testing

### Local Testing

1. Install a Hedera wallet browser extension (HashPack recommended)
2. Create a testnet account in the wallet
3. Run the app: `npm run dev`
4. Click "Connect Hedera Wallet" button
5. Approve the connection in your wallet

### Testnet Resources

- **Faucet**: [Hedera Testnet Faucet](https://testnet.faucet.devnet.hederadev.com/) - Get free testnet HBAR
- **Mirror Node Explorer**: [HashScan Testnet](https://hashscan.io/testnet)

## Troubleshooting

### "Wallet not found" Error

- Ensure you have a Hedera wallet extension installed (HashPack, Kabila, or Dropp)
- Refresh the browser page
- Check that the wallet extension is enabled

### "No accounts available" Error

- Make sure your wallet has at least one account created
- Create an account in your wallet extension if needed

### Project ID Not Found Warning

- Set the `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` environment variable
- Restart the `npm run dev` server after changing environment variables

### Modal Not Opening

- Verify your `NEXT_PUBLIC_APP_URL` matches your current domain
- Clear browser cache and local storage
- Check browser console for error messages

## Network Information

- **Network**: Hedera Testnet
- **Chain ID**: `hedera:testnet:0.0.3`
- **Mirror Node**: https://testnet.mirrornode.hedera.com
- **Consensus Nodes**: Available on Hedera documentation

## Resources

- [Hedera Documentation](https://docs.hedera.com)
- [Hedera Wallet Connect GitHub](https://github.com/hashgraph/hedera-wallet-connect)
- [WalletConnect Documentation](https://docs.walletconnect.com)
- [Hiero SDK Documentation](https://github.com/hiero-ledger/hiero-sdk-js)

## Next Steps

1. Set up environment variables
2. Install dependencies with `npm install`
3. Test the wallet connection in your app
4. Implement transaction signing for your features
5. Deploy to production (ensure domain matches WalletConnect project settings)
