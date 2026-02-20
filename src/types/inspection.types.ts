export type ConditionClassification = 
  | 'INTACT'
  | 'ANOMALY'
  | 'BREACH'

export interface Mission {
  id: string
  zoneId: string
  operatorId: string
  scheduledAt: Date
  startedAt?: Date
  completedAt?: Date
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'INCOMPLETE' | 'FAILED'
  totalCheckpoints: number
  completedCheckpoints: number
  incompleteReason?: string
}

export interface InspectionRecord {
  id: string
  missionId: string
  zoneId: string
  checkpointId: string
  operatorId: string
  capturedAt: Date
  latitude: number
  longitude: number
  gpsAccuracy: number
  imageUrl: string
  imageHash: string
  condition: ConditionClassification
  notes?: string
  evidenceHash: string
  hcsTopicId: string
  hcsTransactionId?: string
  hcsTimestamp?: Date
  anchorStatus: 'PENDING' | 'ANCHORED' | 'FAILED'
}
