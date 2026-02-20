import { NextRequest, NextResponse } from 'next/server'

const mockCheckpoints: Record<string, unknown>[] = []

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const zoneId = searchParams.get('zoneId')
  
  const filtered = zoneId
    ? mockCheckpoints.filter((c) => c.zoneId === zoneId)
    : mockCheckpoints
  
  return NextResponse.json(filtered)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const checkpoint = {
      id: crypto.randomUUID(),
      ...body,
      createdAt: new Date().toISOString(),
    }
    mockCheckpoints.push(checkpoint)
    return NextResponse.json(checkpoint, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create checkpoint' }, { status: 500 })
  }
}
