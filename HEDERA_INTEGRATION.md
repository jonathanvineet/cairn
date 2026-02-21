# Hedera WalletConnect Integration

This project integrates Hedera blockchain using WalletConnect v2 with the native Hedera JSON-RPC specification.

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- A WalletConnect Project ID from [cloud.walletconnect.com](https://cloud.walletconnect.com)
- A Hedera wallet supporting WalletConnect (HashPack, Kabila, or Dropp)

### 2. Environment Setup

Your `.env` file is already configured with:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Installation

All required dependencies are already installed:

```bash
npm install @hashgraph/hedera-wallet-connect @hiero-ledger/sdk @walletconnect/modal
```

### 4. Run the Development Server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Architecture

### Core Files

- **`lib/walletConfig.ts`** - Initializes DAppConnector with Hedera network settings
- **`lib/useHederaWallet.ts`** - React hook for wallet operations (sign, execute transactions)
- **`lib/hederaHelpers.ts`** - Utility functions for transaction handling and multi-sig
- **`stores/walletStore.ts`** - Zustand store for wallet state management
- **`components/WalletConnect.tsx`** - UI component for wallet connection

### Integration Approach

We use the **Hedera Native JSON-RPC** approach with `DAppConnector`:

✅ Native Hedera transaction support  
✅ Direct communication with Hedera wallets via WalletConnect  
✅ No JSON-RPC Relay provider needed  
✅ Full access to Hedera SDK features  

## 🔧 Usage Examples

### Connect Wallet

```tsx
import { WalletConnect } from '@/components/WalletConnect'

export function MyComponent() {
  return <WalletConnect />
}
```

### Send HBAR Transaction

```tsx
import { useHederaWallet } from '@/lib/useHederaWallet'
import { TransferTransaction, Hbar } from '@hiero-ledger/sdk'

export function TransferDemo() {
  const { signAndExecuteTransaction, selectedAccount } = useHederaWallet()

  const sendHbar = async () => {
    const transaction = new TransferTransaction()
      .addHbarTransfer(selectedAccount.id, new Hbar(-10))
      .addHbarTransfer('0.0.1234', new Hbar(10))

    const frozenTx = await transaction.freeze()
    const result = await signAndExecuteTransaction(frozenTx)
    
    console.log('Success!', result)
  }

  return <button onClick={sendHbar}>Send 10 HBAR</button>
}
```

### Multi-Signature Transactions

For workflows requiring backend co-signing:

```tsx
// Frontend: User signs
const { signTransaction, transactionToBase64String } = useHederaWallet()

const signedTx = await signTransaction(transaction)
const base64 = transactionToBase64String(signedTx)

// Send to backend
await fetch('/api/execute-transaction', {
  method: 'POST',
  body: JSON.stringify({ signedTransaction: base64 })
})
```

```ts
// Backend: Add signature and execute
import { addSignatureToTransaction } from '@/lib/hederaHelpers'

const fullySignedTx = await addSignatureToTransaction(
  userSignedTx,
  backendPrivateKey
)

await fullySignedTx.execute(client)
```

See [`examples/hederaExamples.ts`](./examples/hederaExamples.ts) for complete examples.

## 🔐 Security Best Practices

1. **Never expose private keys** in frontend code
2. **Always freeze transactions** before signing: `await transaction.freeze()`
3. **Validate on backend** before co-signing multi-sig transactions
4. **Use environment variables** for sensitive configuration
5. **Implement rate limiting** for transaction endpoints

## 🌐 Network Configuration

Currently configured for **Hedera Testnet**.

To switch to Mainnet:

```ts
// lib/walletConfig.ts
LedgerId.MAINNET,  // instead of LedgerId.TESTNET
[HederaChainId.Mainnet]  // instead of [HederaChainId.Testnet]
```

## 🧪 Testing

### Get Test HBAR
- Create testnet account: [portal.hedera.com](https://portal.hedera.com)
- Faucet for test HBAR: Built into the portal

### Testnet Explorer
- View transactions: [hashscan.io/testnet](https://hashscan.io/testnet)

## 📖 Resources

- [Hedera Docs](https://docs.hedera.com)
- [WalletConnect Integration Guide](https://github.com/hashgraph/hedera-wallet-connect)
- [Hedera SDK Documentation](https://docs.hedera.com/hedera/sdks-and-apis/sdks)
- [WalletConnect Cloud](https://cloud.walletconnect.com)

## 🐛 Troubleshooting

### ChunkLoadError with Turbopack
**Error:** `Failed to load chunk ... from module @walletconnect/modal-ui`

**Solution:** The project is configured to use webpack instead of Turbopack for compatibility with WalletConnect Modal. Run:
```bash
npm run dev  # Uses webpack (default)
```

If you want to try Turbopack (experimental):
```bash
npm run dev:turbo  # May have issues with WalletConnect
```

### Wallet won't connect
- Ensure your WalletConnect Project ID is valid
- Check that wallet app is on the same network (testnet/mainnet)
- Try clearing browser cache and reconnecting

### Transaction fails
- Ensure transaction is frozen: `await transaction.freeze()`
- Check account has sufficient HBAR balance
- Verify recipient account ID format: `0.0.xxxx`

### TypeScript errors
- Run `npm install` to ensure all dependencies are installed
- Check that `@hiero-ledger/sdk` version is 2.79.0 or higher
- Verify `@hiero-ledger/proto` is installed

## 📝 License

MIT
