import { NextRequest, NextResponse } from 'next/server'

const mockIncidents: Record<string, unknown>[] = []

export async function GET() {
  return NextResponse.json(mockIncidents)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const incident = {
      id: crypto.randomUUID(),
      ...body,
      status: 'OPEN',
      linkedInspectionIds: [],
      linkedEvidenceIds: [],
      reportedAt: new Date().toISOString(),
    }
    mockIncidents.push(incident)
    return NextResponse.json(incident, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create incident' }, { status: 500 })
  }
}
