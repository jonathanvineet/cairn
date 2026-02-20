import { NextRequest, NextResponse } from 'next/server'
import { DEMO_INCIDENTS } from '@/lib/placeholder'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const zoneId = searchParams.get('zoneId')
  const status = searchParams.get('status')

  let incidents = [...DEMO_INCIDENTS]
  if (zoneId) incidents = incidents.filter(i => i.zoneId === zoneId)
  if (status) incidents = incidents.filter(i => i.status === status)

  return NextResponse.json({ incidents, total: incidents.length })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'Not implemented — database integration pending' }, { status: 501 })
}
