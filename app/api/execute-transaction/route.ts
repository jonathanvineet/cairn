/**
 * Multi-Signature Transaction Execution API
 * 
 * This API route demonstrates how to:
 * 1. Receive a user-signed transaction from the frontend
 * 2. Validate the transaction details
 * 3. Add a backend signature (co-sign)
 * 4. Execute the fully-signed transaction on Hedera
 * 
 * SECURITY NOTES:
 * - Always validate transaction contents before adding your signature
 * - Implement authentication and authorization
 * - Add rate limiting to prevent abuse
 * - Store private keys securely (environment variables, key vault, HSM)
 * - Log all transactions for audit purposes
 */

import { NextRequest, NextResponse } from 'next/server'
import { Transaction, PrivateKey, Client, AccountId } from '@hiero-ledger/sdk'
import { addSignatureToTransaction } from '@/lib/hederaHelpers'

// Environment variables required (add to .env or .env.local):
// BACKEND_PRIVATE_KEY=302e... (your backend account private key)
// BACKEND_ACCOUNT_ID=0.0.xxxx (your backend account ID)

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { signedTransaction, recipientId, amount, userId } = body

    // 1. AUTHENTICATION CHECK
    // TODO: Implement your authentication logic here
    // Example: Verify JWT token, check session, etc.
    // if (!isAuthenticated(request)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // 2. VALIDATION - Check transaction limits
    if (!signedTransaction) {
      return NextResponse.json(
        { error: 'Missing signed transaction' },
        { status: 400 }
      )
    }

    // Validate amount
    const amountNum = Number(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Check maximum allowed amount (example: 1000 HBAR)
    const MAX_AMOUNT = 1000
    if (amountNum > MAX_AMOUNT) {
      return NextResponse.json(
        { error: `Amount exceeds maximum allowed (${MAX_AMOUNT} HBAR)` },
        { status: 400 }
      )
    }

    // 3. RECONSTRUCT TRANSACTION
    const transactionBytes = Buffer.from(signedTransaction, 'base64')
    const userSignedTx = Transaction.fromBytes(transactionBytes)

    // 4. ADDITIONAL VALIDATION
    // You can inspect the transaction before co-signing
    // Example: Check transaction type, memo, etc.
    console.log('Transaction to co-sign:', {
      userId,
      recipientId,
      amount,
      type: userSignedTx.constructor.name,
    })

    // 5. LOAD BACKEND CREDENTIALS
    const backendPrivateKey = process.env.BACKEND_PRIVATE_KEY
    const backendAccountId = process.env.BACKEND_ACCOUNT_ID

    if (!backendPrivateKey || !backendAccountId) {
      console.error('Backend credentials not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Parse private key
    let privateKey: PrivateKey
    try {
      privateKey = PrivateKey.fromStringED25519(backendPrivateKey)
    } catch {
      // Try ECDSA format if ED25519 fails
      privateKey = PrivateKey.fromStringECDSA(backendPrivateKey)
    }

    // 6. ADD BACKEND SIGNATURE
    console.log('Adding backend signature...')
    const fullySignedTx = await addSignatureToTransaction(
      userSignedTx,
      privateKey
    )

    // 7. EXECUTE TRANSACTION
    console.log('Executing transaction...')
    const client = Client.forTestnet() // Use Client.forMainnet() for production
    client.setOperator(AccountId.fromString(backendAccountId), privateKey)

    const txResponse = await fullySignedTx.execute(client)
    const receipt = await txResponse.getReceipt(client)

    // 8. LOG TRANSACTION (for audit trail)
    console.log('Transaction executed:', {
      transactionId: txResponse.transactionId.toString(),
      status: receipt.status.toString(),
      userId,
      amount,
      recipientId,
    })

    // 9. RETURN SUCCESS RESPONSE
    return NextResponse.json({
      success: true,
      transactionId: txResponse.transactionId.toString(),
      status: receipt.status.toString(),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Transaction execution error:', error)

    // Return appropriate error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// Optional: GET endpoint to check API health
export async function GET() {
  const hasCredentials =
    process.env.BACKEND_PRIVATE_KEY && process.env.BACKEND_ACCOUNT_ID

  return NextResponse.json({
    status: 'ok',
    configured: hasCredentials,
    timestamp: new Date().toISOString(),
  })
}
