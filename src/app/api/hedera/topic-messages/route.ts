import { NextRequest, NextResponse } from 'next/server'
import { fetchTopicMessages } from '@/lib/hedera/hcs'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const topicId = searchParams.get('topicId')
  const limit = parseInt(searchParams.get('limit') ?? '50', 10)

  if (!topicId) {
    return NextResponse.json({ error: 'Missing topicId query parameter' }, { status: 400 })
  }

  try {
    const messages = await fetchTopicMessages(topicId, Math.min(limit, 100))
    return NextResponse.json({ messages })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch topic messages' }, { status: 500 })
  }
}
