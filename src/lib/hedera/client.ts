import { Client, AccountId, PrivateKey } from '@hashgraph/sdk'

let client: Client | null = null

export function getHederaClient(): Client {
  if (client) return client

  const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet'
  const operatorId = process.env.HEDERA_OPERATOR_ID
  const operatorKey = process.env.HEDERA_OPERATOR_PRIVATE_KEY

  if (!operatorId || !operatorKey) {
    throw new Error('Hedera operator credentials not configured')
  }

  if (network === 'mainnet') {
    client = Client.forMainnet()
  } else {
    client = Client.forTestnet()
  }

  client.setOperator(
    AccountId.fromString(operatorId),
    PrivateKey.fromString(operatorKey)
  )

  return client
}
