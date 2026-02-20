import { NextRequest, NextResponse } from 'next/server'
import { generateCertificateNumber, generateCertificateContent } from '@/lib/utils/certificate'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { zone, records } = body

    const certNumber = generateCertificateNumber()
    const content = generateCertificateContent({
      zone,
      records,
      generatedAt: new Date(),
      certificationNumber: certNumber,
    })

    return NextResponse.json({
      certificationNumber: certNumber,
      content,
      generatedAt: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ error: 'Failed to generate certificate' }, { status: 500 })
  }
}
