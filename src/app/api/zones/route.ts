import { NextRequest, NextResponse } from 'next/server'
import { DEMO_ZONES } from '@/lib/placeholder'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const state = searchParams.get('state')

  let zones = [...DEMO_ZONES]
  if (status) zones = zones.filter(z => z.status === status)
  if (state) zones = zones.filter(z => z.state === state)

  return NextResponse.json({ zones, total: zones.length })
}

export async function POST(request: NextRequest) {
  // ADMIN only in production
  return NextResponse.json({ error: 'Not implemented — database integration pending' }, { status: 501 })
}
