import { NextRequest, NextResponse } from 'next/server'
import { DEMO_RECORDS } from '@/lib/placeholder'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const zoneId = searchParams.get('zoneId')
  const condition = searchParams.get('condition')

  let records = [...DEMO_RECORDS]
  if (zoneId) records = records.filter(r => r.zoneId === zoneId)
  if (condition) records = records.filter(r => r.condition === condition)

  records.sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime())

  return NextResponse.json({ records, total: records.length })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'Not implemented — database integration pending' }, { status: 501 })
}
