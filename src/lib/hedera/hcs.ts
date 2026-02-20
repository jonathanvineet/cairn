import type { HCSInspectionPayload, HCSMessage } from '@/types'

export interface HCSSubmitResult {
  success: boolean
  transactionId?: string
  consensusTimestamp?: string
  sequenceNumber?: number
  error?: string
}

export async function submitToHCS(
  payload: HCSInspectionPayload,
  topicId: string
): Promise<HCSSubmitResult> {
  // Placeholder implementation — real SDK call goes here
  // In production: use @hashgraph/sdk TopicMessageSubmitTransaction
  try {
    const message = JSON.stringify(payload)
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 100))

    // Return mock result for development
    const mockTimestamp = Math.floor(Date.now() / 1000)
    return {
      success: true,
      transactionId: `0.0.${topicId.split('.')[2]}@${mockTimestamp}.000`,
      consensusTimestamp: new Date().toISOString(),
      sequenceNumber: Math.floor(Math.random() * 1000) + 1,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function fetchTopicMessages(
  topicId: string,
  limit: number = 50
): Promise<HCSMessage[]> {
  try {
    const mirrorNodeUrl = process.env.HEDERA_MIRROR_NODE_URL ?? 'https://testnet.mirrornode.hedera.com'
    const url = `${mirrorNodeUrl}/api/v1/topics/${topicId}/messages?limit=${limit}&order=desc`

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 30 },
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return (data.messages ?? []).map((m: Record<string, unknown>) => ({
      sequenceNumber: m.sequence_number as number,
      consensusTimestamp: m.consensus_timestamp as string,
      message: Buffer.from(m.message as string, 'base64').toString('utf-8'),
      transactionId: m.running_hash as string ?? '',
    }))
  } catch {
    return []
  }
}

export async function verifyRecordInHCS(
  evidenceHash: string,
  topicId: string
): Promise<{ verified: boolean; transactionId?: string; consensusTimestamp?: string }> {
  try {
    const messages = await fetchTopicMessages(topicId, 100)
    for (const msg of messages) {
      try {
        const payload = JSON.parse(msg.message)
        if (payload.evidenceHash === evidenceHash) {
          return {
            verified: true,
            transactionId: msg.transactionId,
            consensusTimestamp: msg.consensusTimestamp,
          }
        }
      } catch {
        // skip invalid messages
      }
    }
    return { verified: false }
  } catch {
    return { verified: false }
  }
}
