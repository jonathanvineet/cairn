import { NextRequest, NextResponse } from 'next/server'

const mockInspections: Record<string, unknown>[] = []

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const zoneId = searchParams.get('zoneId')
  
  const filtered = zoneId
    ? mockInspections.filter((r) => r.zoneId === zoneId)
    : mockInspections
  
  return NextResponse.json(filtered)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const record = {
      id: crypto.randomUUID(),
      ...body,
      anchorStatus: 'PENDING',
      createdAt: new Date().toISOString(),
    }
    mockInspections.push(record)
    return NextResponse.json(record, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create inspection record' }, { status: 500 })
  }
}
