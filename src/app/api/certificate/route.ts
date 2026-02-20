import { NextRequest, NextResponse } from 'next/server'
import { getRecordById, getCheckpointById, getZoneById, getUserById } from '@/lib/placeholder'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const recordId = searchParams.get('recordId')

  if (!recordId) {
    return NextResponse.json({ error: 'Missing recordId parameter' }, { status: 400 })
  }

  const record = getRecordById(recordId)
  if (!record) {
    return NextResponse.json({ error: 'Record not found' }, { status: 404 })
  }

  const checkpoint = getCheckpointById(record.checkpointId)
  const zone = getZoneById(record.zoneId)
  const operator = getUserById(record.operatorId)

  const certNo = `CERT-2024-${recordId.replace('rec-', '').padStart(5, '0')}`

  const certificate = {
    certificateNumber: certNo,
    generatedAt: new Date().toISOString(),
    record: {
      id: record.id,
      zone: zone?.name ?? record.zoneId,
      checkpoint: checkpoint?.name ?? record.checkpointId,
      capturedAt: record.capturedAt,
      operatorAccount: operator?.hederaAccountId ?? record.operatorId,
      condition: record.condition,
      imageHash: record.imageHash,
      evidenceHash: record.evidenceHash,
      hederaTopicId: record.hederaTopicId,
      hederaTransactionId: record.hederaTransactionId,
      hederaConsensusTimestamp: record.hederaConsensusTimestamp,
    },
    legalNote: 'This certificate constitutes a Section 65B compliant electronic record under the Indian Evidence Act, 1872.',
  }

  return NextResponse.json(certificate)
}
