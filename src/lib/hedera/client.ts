// SERVER-SIDE ONLY — never import in client components
// This module is for API routes only

export interface HederaClientConfig {
  operatorAccountId: string
  operatorPrivateKey: string
  network: 'testnet' | 'mainnet'
}

export function getServerHederaConfig(): HederaClientConfig {
  const operatorAccountId = process.env.HEDERA_OPERATOR_ACCOUNT_ID ?? '0.0.0'
  const operatorPrivateKey = process.env.HEDERA_OPERATOR_PRIVATE_KEY ?? ''
  const network = (process.env.HEDERA_NETWORK ?? 'testnet') as 'testnet' | 'mainnet'
  return { operatorAccountId, operatorPrivateKey, network }
}

export function getInspectionTopicId(): string {
  return process.env.HEDERA_INSPECTION_TOPIC_ID ?? '0.0.0'
}

export function getAlertTopicId(): string {
  return process.env.HEDERA_ALERT_TOPIC_ID ?? '0.0.0'
}
