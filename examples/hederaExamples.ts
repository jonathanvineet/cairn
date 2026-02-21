/**
 * Hedera WalletConnect Integration Examples
 * 
 * This file demonstrates how to use the Hedera WalletConnect integration in your app.
 * These are examples only - copy and adapt them to your use case.
 */

import { useHederaWallet } from "@/lib/useHederaWallet";
import { TransferTransaction, Hbar, AccountId } from "@hiero-ledger/sdk";

// =============================================================================
// Example 1: Simple HBAR Transfer (Sign & Execute in Wallet)
// =============================================================================

export function useSimpleTransfer() {
  const { signAndExecuteTransaction, selectedAccount } = useHederaWallet();

  const sendHbar = async (recipientId: string, amount: number) => {
    if (!selectedAccount) {
      throw new Error("No wallet connected");
    }

    // Create a transfer transaction
    const transaction = new TransferTransaction()
      .addHbarTransfer(selectedAccount.id, new Hbar(-amount))
      .addHbarTransfer(recipientId, new Hbar(amount))
      .setTransactionMemo(`Transfer ${amount} HBAR`);

    // Freeze the transaction (required before signing)
    const frozenTx = await transaction.freeze();

    // Sign and execute (wallet does both)
    const result = await signAndExecuteTransaction(frozenTx);

    console.log("Transaction successful!", result);
    return result;
  };

  return { sendHbar };
}

// =============================================================================
// Example 2: Sign Only (for Multi-Signature Workflows)
// =============================================================================

export function useSignOnly() {
  const {
    signTransaction,
    transactionToBase64String,
    selectedAccount,
  } = useHederaWallet();

  const signForBackend = async (recipientId: string, amount: number) => {
    if (!selectedAccount) {
      throw new Error("No wallet connected");
    }

    // Create transaction
    const transaction = new TransferTransaction()
      .addHbarTransfer(selectedAccount.id, new Hbar(-amount))
      .addHbarTransfer(recipientId, new Hbar(amount))
      .setTransactionMemo("Multi-sig transfer");

    // Freeze before signing
    const frozenTx = await transaction.freeze();

    // Sign (does NOT execute)
    const signedTx = await signTransaction(frozenTx);

    // Convert to base64 for transmission to backend
    const signedTxBase64 = transactionToBase64String(signedTx);

    // Send to backend for co-signing and execution
    const response = await fetch("/api/execute-transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        signedTransaction: signedTxBase64,
        recipientId,
        amount,
      }),
    });

    const result = await response.json();
    console.log("Backend executed transaction:", result);
    return result;
  };

  return { signForBackend };
}

// =============================================================================
// Example 3: Backend API - Co-sign and Execute
// =============================================================================

/**
 * This would be in your backend API route (e.g., app/api/execute-transaction/route.ts)
 * 
 * Example Next.js API route:
 */

/*
import { NextRequest, NextResponse } from "next/server";
import { Transaction, PrivateKey, Client, AccountId } from "@hiero-ledger/sdk";
import { addSignatureToTransaction } from "@/lib/hederaHelpers";

export async function POST(request: NextRequest) {
  try {
    const { signedTransaction, recipientId, amount } = await request.json();

    // Validate the transaction details before co-signing
    // This is critical for security!
    if (amount > 1000) {
      return NextResponse.json(
        { error: "Amount exceeds maximum allowed" },
        { status: 400 }
      );
    }

    // Reconstruct transaction from base64
    const transactionBytes = Buffer.from(signedTransaction, "base64");
    const userSignedTx = Transaction.fromBytes(transactionBytes);

    // Load backend private key from environment
    const backendPrivateKey = PrivateKey.fromStringED25519(
      process.env.BACKEND_PRIVATE_KEY!
    );

    // Add backend signature
    const fullySignedTx = await addSignatureToTransaction(
      userSignedTx,
      backendPrivateKey
    );

    // Execute the transaction
    const client = Client.forTestnet();
    const backendAccountId = AccountId.fromString(process.env.BACKEND_ACCOUNT_ID!);
    client.setOperator(backendAccountId, backendPrivateKey);

    const txResponse = await fullySignedTx.execute(client);
    const receipt = await txResponse.getReceipt(client);

    return NextResponse.json({
      success: true,
      transactionId: txResponse.transactionId.toString(),
      status: receipt.status.toString(),
    });
  } catch (error) {
    console.error("Transaction execution error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
*/

// =============================================================================
// Example 4: Complete React Component with Wallet Connection
// =============================================================================

/*
'use client'

import { useState } from 'react'
import { useWalletStore } from '@/stores/walletStore'
import { useSimpleTransfer } from './examples/hederaExamples'
import { Button } from '@/components/ui/button'
import { WalletConnect } from '@/components/WalletConnect'

export function TransferDemo() {
  const { connected, selectedAccount } = useWalletStore()
  const { sendHbar } = useSimpleTransfer()
  const [recipientId, setRecipientId] = useState('0.0.1234')
  const [amount, setAmount] = useState(10)
  const [sending, setSending] = useState(false)

  const handleTransfer = async () => {
    setSending(true)
    try {
      await sendHbar(recipientId, amount)
      alert('Transfer successful!')
    } catch (error) {
      console.error(error)
      alert('Transfer failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setSending(false)
    }
  }

  if (!connected) {
    return (
      <div className="p-4">
        <h2>Connect your wallet first</h2>
        <WalletConnect />
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <p>Connected Account: {selectedAccount?.id}</p>
      </div>

      <div className="space-y-2">
        <input
          type="text"
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
          placeholder="Recipient Account ID"
          className="border p-2 rounded"
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          placeholder="Amount (HBAR)"
          className="border p-2 rounded"
        />
      </div>

      <Button onClick={handleTransfer} disabled={sending}>
        {sending ? 'Sending...' : 'Send HBAR'}
      </Button>
    </div>
  )
}
*/

// =============================================================================
// Example 5: Query Account Balance
// =============================================================================

/*
import { Client, AccountBalanceQuery, AccountId } from "@hiero-ledger/sdk";

export async function getAccountBalance(accountId: string) {
  const client = Client.forTestnet();

  const balance = await new AccountBalanceQuery()
    .setAccountId(AccountId.fromString(accountId))
    .execute(client);

  console.log(`Account ${accountId} balance: ${balance.hbars.toString()}`);
  return balance.hbars.toString();
}
*/

// =============================================================================
// Notes & Best Practices
// =============================================================================

/**
 * IMPORTANT NOTES:
 * 
 * 1. Freeze Transactions: Always freeze() transactions before signing
 * 
 * 2. Multi-Sig: Use signTransaction() when you need multiple signatures
 *    Use signAndExecuteTransaction() when wallet signature is sufficient
 * 
 * 3. Backend Security: Always validate transaction details on backend before co-signing
 *    - Check amounts, recipients, transaction types
 *    - Implement rate limiting
 *    - Store private keys securely (env vars, HSM, key vault)
 * 
 * 4. Error Handling: Wallet operations can fail - always wrap in try/catch
 * 
 * 5. Network: Make sure wallet and your app are on the same network (testnet/mainnet)
 * 
 * 6. Account IDs: Use format 0.0.xxxx (shard.realm.num)
 * 
 * 7. Testing: Use Hedera Testnet for development
 *    - Get test HBAR from: https://portal.hedera.com
 *    - Testnet explorer: https://hashscan.io/testnet
 */
