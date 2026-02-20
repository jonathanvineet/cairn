import { NextRequest, NextResponse } from 'next/server'
import { verifyEvidenceHash } from '@/lib/hedera/hcs'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const topicId = searchParams.get('topicId')
  const evidenceHash = searchParams.get('evidenceHash')

  if (!topicId || !evidenceHash) {
    return NextResponse.json(
      { error: 'topicId and evidenceHash are required' },
      { status: 400 }
    )
  }

  try {
    const result = await verifyEvidenceHash(topicId, evidenceHash)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: 'Failed to verify evidence hash' },
      { status: 500 }
    )
  }
}
