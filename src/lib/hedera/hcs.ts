import { HCSInspectionPayload } from '@/types/hedera.types'

export async function queryHCSMessages(
  topicId: string,
  limit: number = 100
): Promise<Record<string, unknown>[]> {
  const mirrorNode = process.env.NEXT_PUBLIC_HEDERA_MIRROR_NODE
  const response = await fetch(
    `${mirrorNode}/api/v1/topics/${topicId}/messages?limit=${limit}&order=desc`
  )
  const data = await response.json()
  return data.messages || []
}

export async function verifyEvidenceHash(
  topicId: string,
  evidenceHash: string
): Promise<{ found: boolean; transactionId?: string; timestamp?: string }> {
  const messages = await queryHCSMessages(topicId, 1000)
  
  for (const msg of messages) {
    const decoded = Buffer.from(msg.message as string, 'base64').toString('utf-8')
    const payload: HCSInspectionPayload = JSON.parse(decoded)
    
    if (payload.evidenceHash === evidenceHash) {
      return {
        found: true,
        transactionId: msg.transaction_id as string,
        timestamp: msg.consensus_timestamp as string,
      }
    }
  }
  
  return { found: false }
}
