import { NextRequest, NextResponse } from 'next/server'
import { verifyRecordInHCS } from '@/lib/hedera/hcs'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const hash = searchParams.get('hash')
  const topicId = searchParams.get('topicId')

  if (!hash || !topicId) {
    return NextResponse.json({ error: 'Missing hash or topicId query parameter' }, { status: 400 })
  }

  try {
    const result = await verifyRecordInHCS(hash, topicId)
    return NextResponse.json({ verified: result.verified, transactionId: result.transactionId, consensusTimestamp: result.consensusTimestamp })
  } catch {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
