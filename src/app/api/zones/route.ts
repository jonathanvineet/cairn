import { NextRequest, NextResponse } from 'next/server'

const mockZones: Record<string, unknown>[] = []

export async function GET() {
  return NextResponse.json(mockZones)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const zone = {
      id: crypto.randomUUID(),
      ...body,
      status: 'ACTIVE',
      riskScore: 0,
      checkpoints: [],
      createdAt: new Date().toISOString(),
    }
    mockZones.push(zone)
    return NextResponse.json(zone, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create zone' }, { status: 500 })
  }
}
