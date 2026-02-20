import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { hashInspectionRecord } from '@/lib/hedera/hash'
import { submitToHCS } from '@/lib/hedera/hcs'
import { getInspectionTopicId } from '@/lib/hedera/client'

const bodySchema = z.object({
  recordId: z.string(),
  imageHash: z.string(),
  zoneId: z.string(),
  checkpointId: z.string(),
  missionId: z.string(),
  capturedAt: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  condition: z.enum(['INTACT', 'ANOMALY', 'BREACH']),
  operatorAccountId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body', details: parsed.error.flatten() }, { status: 400 })
    }

    const payload = parsed.data
    const evidenceHash = await hashInspectionRecord(payload)
    const topicId = getInspectionTopicId()

    const result = await submitToHCS({ ...payload }, topicId)

    if (!result.success) {
      return NextResponse.json({ error: result.error ?? 'HCS submission failed' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      transactionId: result.transactionId,
      consensusTimestamp: result.consensusTimestamp,
      sequenceNumber: result.sequenceNumber,
      evidenceHash,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
