export type ZoneStatus = 
  | 'ACTIVE'
  | 'ALERT'
  | 'BREACH'
  | 'INACTIVE'
  | 'MAINTENANCE'

export interface BoundaryZone {
  id: string
  name: string
  region: string
  state: string
  status: ZoneStatus
  totalLengthKm: number
  checkpointCount: number
  coordinates: Array<[number, number]>
  checkpoints: Checkpoint[]
  lastInspectedAt?: Date
  riskScore: number
  stakeholders: {
    forestDeptId?: string
    estateOwnerId?: string
    insurerId?: string
  }
  createdAt: Date
}

export interface Checkpoint {
  id: string
  zoneId: string
  name: string
  sequenceNumber: number
  latitude: number
  longitude: number
  isHighRisk: boolean
  lastCondition?: import('./inspection.types').ConditionClassification
}
