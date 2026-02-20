export async function hashInspectionRecord(record: {
  recordId: string
  imageHash: string
  zoneId: string
  checkpointId: string
  missionId: string
  capturedAt: string
  latitude: number
  longitude: number
  condition: string
  operatorAccountId: string
}): Promise<string> {
  const data = JSON.stringify(record, Object.keys(record).sort())
  const encoder = new TextEncoder()
  const buffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function hashImageFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function hashImageUrl(url: string): Promise<string> {
  // For placeholder/demo purposes, return a deterministic fake hash
  const encoder = new TextEncoder()
  const buffer = encoder.encode(url)
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
