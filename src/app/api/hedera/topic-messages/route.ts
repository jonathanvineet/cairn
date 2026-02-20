import { NextRequest, NextResponse } from 'next/server'
import { queryHCSMessages } from '@/lib/hedera/hcs'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const topicId = searchParams.get('topicId')
  const limit = parseInt(searchParams.get('limit') || '100')

  if (!topicId) {
    return NextResponse.json({ error: 'topicId is required' }, { status: 400 })
  }

  try {
    const messages = await queryHCSMessages(topicId, limit)
    return NextResponse.json({ messages })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch topic messages' }, { status: 500 })
  }
}
