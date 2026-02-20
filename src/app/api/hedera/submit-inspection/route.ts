import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    await request.json()
    
    const mockTransactionId = `0.0.0@${Date.now()}.000000000`
    
    return NextResponse.json({
      success: true,
      transactionId: mockTransactionId,
      message: 'Inspection record submitted to HCS',
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to submit inspection record' },
      { status: 500 }
    )
  }
}
