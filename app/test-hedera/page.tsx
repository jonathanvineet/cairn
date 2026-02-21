'use client'

/**
 * Hedera Integration Test Page
 * 
 * This page demonstrates all the features of the Hedera WalletConnect integration.
 * Use this as a reference for implementing Hedera features in your app.
 */

import { useState } from 'react'
import { useWalletStore } from '@/stores/walletStore'
import { useHederaWallet } from '@/lib/useHederaWallet'
import { WalletConnect } from '@/components/WalletConnect'
import { WalletDebugPanel } from '@/components/WalletDebugPanel'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TransferTransaction, 
  Hbar, 
  AccountId,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction 
} from '@hiero-ledger/sdk'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

export default function HederaTestPage() {
  const { connected, selectedAccount } = useWalletStore()
  const { signAndExecuteTransaction, signTransaction, transactionToBase64String } = useHederaWallet()

  const [recipientId, setRecipientId] = useState('0.0.1234')
  const [amount, setAmount] = useState('10')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const [signedTxBase64, setSignedTxBase64] = useState('')

  // Test 1: Simple HBAR Transfer
  const handleSimpleTransfer = async () => {
    if (!selectedAccount) return

    setStatus('loading')
    setStatusMessage('Creating and signing transaction...')

    try {
      const transaction = new TransferTransaction()
        .addHbarTransfer(AccountId.fromString(selectedAccount.id), new Hbar(-Number(amount)))
        .addHbarTransfer(AccountId.fromString(recipientId), new Hbar(Number(amount)))
        .setTransactionMemo(`Test transfer: ${amount} HBAR`)

      const frozenTx = await transaction.freeze()
      
      setStatusMessage('Waiting for wallet confirmation...')
      const result = await signAndExecuteTransaction(frozenTx)

      setStatus('success')
      setStatusMessage(`Transaction executed successfully! ${JSON.stringify(result)}`)
    } catch (error) {
      setStatus('error')
      setStatusMessage(error instanceof Error ? error.message : 'Unknown error')
      console.error(error)
    }
  }

  // Test 2: Sign Only (Multi-Sig)
  const handleSignOnly = async () => {
    if (!selectedAccount) return

    setStatus('loading')
    setStatusMessage('Creating transaction for signing...')

    try {
      const transaction = new TransferTransaction()
        .addHbarTransfer(AccountId.fromString(selectedAccount.id), new Hbar(-Number(amount)))
        .addHbarTransfer(AccountId.fromString(recipientId), new Hbar(Number(amount)))
        .setTransactionMemo('Multi-sig test')

      const frozenTx = await transaction.freeze()
      
      setStatusMessage('Waiting for wallet signature (not executing)...')
      const signedTx = await signTransaction(frozenTx)

      const base64 = transactionToBase64String(signedTx)
      setSignedTxBase64(base64)

      setStatus('success')
      setStatusMessage('Transaction signed! Base64 below can be sent to backend.')
    } catch (error) {
      setStatus('error')
      setStatusMessage(error instanceof Error ? error.message : 'Unknown error')
      console.error(error)
    }
  }

  // Test 3: Create HCS Topic
  const handleCreateTopic = async () => {
    if (!selectedAccount) return

    setStatus('loading')
    setStatusMessage('Creating Hedera Consensus Service topic...')

    try {
      const transaction = new TopicCreateTransaction()
        .setTopicMemo('Cairn Drone Network - Test Topic')

      const frozenTx = await transaction.freeze()
      
      setStatusMessage('Waiting for wallet confirmation...')
      const result = await signAndExecuteTransaction(frozenTx)

      setStatus('success')
      setStatusMessage(`Topic created! ${JSON.stringify(result)}`)
    } catch (error) {
      setStatus('error')
      setStatusMessage(error instanceof Error ? error.message : 'Unknown error')
      console.error(error)
    }
  }

  const StatusIndicator = () => {
    if (status === 'idle') return null

    return (
      <Card className="mt-4">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin text-blue-500 mt-0.5" />}
            {status === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />}
            {status === 'error' && <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />}
            <div className="flex-1 space-y-2">
              <p className="text-sm break-all">{statusMessage}</p>
              {signedTxBase64 && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-xs font-mono break-all">{signedTxBase64}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!connected) {
    return (
      <div className="container max-w-4xl mx-auto p-8 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Hedera Integration Test</CardTitle>
            <CardDescription>
              Connect your Hedera wallet to test the integration. Open console (F12) for detailed connection logs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WalletConnect />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hedera Integration Test</CardTitle>
          <CardDescription>
            Test various Hedera transaction types with WalletConnect
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Connected Account</p>
              <p className="font-mono text-lg">{selectedAccount?.id}</p>
            </div>
            <Badge variant="outline" className="text-xs">
              {selectedAccount?.network}
            </Badge>
          </div>
          <WalletConnect />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test 1: Simple Transfer (Sign & Execute)</CardTitle>
          <CardDescription>
            Creates, signs, and executes a transaction in one step
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipient Account ID</label>
              <input
                type="text"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                placeholder="0.0.1234"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (HBAR)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
          <Button 
            onClick={handleSimpleTransfer} 
            disabled={status === 'loading'}
            className="w-full"
          >
            {status === 'loading' ? 'Processing...' : 'Send HBAR'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test 2: Sign Only (Multi-Sig)</CardTitle>
          <CardDescription>
            Signs transaction without executing - for backend co-signing workflows
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This will sign the transaction but not execute it. The signed transaction 
            can then be sent to a backend service for additional signatures.
          </p>
          <Button 
            onClick={handleSignOnly} 
            disabled={status === 'loading'}
            variant="outline"
            className="w-full"
          >
            {status === 'loading' ? 'Signing...' : 'Sign Transaction Only'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test 3: Create HCS Topic</CardTitle>
          <CardDescription>
            Test Hedera Consensus Service topic creation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Creates a new Hedera Consensus Service topic for publishing messages.
          </p>
          <Button 
            onClick={handleCreateTopic} 
            disabled={status === 'loading'}
            variant="outline"
            className="w-full"
          >
            {status === 'loading' ? 'Creating...' : 'Create HCS Topic'}
          </Button>
        </CardContent>
      </Card>

      <StatusIndicator />

      <Card>
        <CardHeader>
          <CardTitle>Integration Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Approach:</span>
            <span className="font-mono">Hedera Native DAppConnector</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Network:</span>
            <span className="font-mono">Testnet</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">SDK Version:</span>
            <span className="font-mono">@hiero-ledger/sdk 2.79.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">WalletConnect:</span>
            <span className="font-mono">v2.6.2</span>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>See <code className="px-2 py-1 bg-muted rounded">examples/hederaExamples.ts</code> for more examples</p>
        <p className="mt-2">Documentation: <code className="px-2 py-1 bg-muted rounded">HEDERA_INTEGRATION.md</code></p>
      </div>
    </div>
  )
}
