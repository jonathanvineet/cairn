import { InspectionRecord } from '@/types/inspection.types'
import { BoundaryZone } from '@/types/zone.types'
import { formatTimestamp as formatDateTime } from './format'

export interface CertificateData {
  zone: BoundaryZone
  records: InspectionRecord[]
  generatedAt: Date
  certificationNumber: string
}

export function generateCertificateNumber(): string {
  // "65B" references Section 65B of the Indian Evidence Act, 1872 — the legal basis for electronic evidence admissibility
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()
  return `BT-65B-${timestamp}-${random}`
}

export function generateCertificateContent(data: CertificateData): string {
  const { zone, records, generatedAt, certificationNumber } = data
  return `
BOUNDARY TRUTH — SECTION 65B EVIDENCE CERTIFICATE
Certificate No: ${certificationNumber}
Generated: ${formatDateTime(generatedAt)}

BOUNDARY ZONE: ${zone.name}
Region: ${zone.region}, ${zone.state}
Zone ID: ${zone.id}

INSPECTION RECORDS: ${records.length} record(s) anchored to Hedera Consensus Service

${records.map((r, i) => `
Record ${i + 1}:
  Captured: ${formatDateTime(r.capturedAt)}
  Checkpoint: ${r.checkpointId}
  Condition: ${r.condition}
  Evidence Hash: ${r.evidenceHash}
  HCS Transaction: ${r.hcsTransactionId || 'PENDING'}
  Consensus Time: ${r.hcsTimestamp ? formatDateTime(r.hcsTimestamp) : 'PENDING'}
`).join('')}

This certificate is generated pursuant to Section 65B of the Indian Evidence Act, 1872.
The inspection records referenced above are anchored to the Hedera Consensus Service,
providing an immutable, tamper-proof, and timestamped audit trail.
  `.trim()
}
