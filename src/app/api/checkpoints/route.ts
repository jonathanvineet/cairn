import { NextRequest, NextResponse } from 'next/server'
import { DEMO_ZONES } from '@/lib/placeholder'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const zoneId = searchParams.get('zoneId')

  if (!zoneId) {
    const all = DEMO_ZONES.flatMap(z => z.checkpoints)
    return NextResponse.json({ checkpoints: all, total: all.length })
  }

  const zone = DEMO_ZONES.find(z => z.id === zoneId)
  if (!zone) {
    return NextResponse.json({ error: 'Zone not found' }, { status: 404 })
  }

  return NextResponse.json({ checkpoints: zone.checkpoints, total: zone.checkpoints.length })
}
