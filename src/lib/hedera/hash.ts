import { createHash } from 'crypto'

export function hashInspectionRecord(record: {
  recordId: string
  imageHash: string
  zoneId: string
  checkpointId: string
  capturedAt: string
  latitude: number
  longitude: number
  condition: string
  operatorId: string
}): string {
  const payload = JSON.stringify(record, Object.keys(record).sort())
  return createHash('sha256').update(payload).digest('hex')
}

export function hashFile(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex')
}
