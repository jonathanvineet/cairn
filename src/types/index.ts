export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'OPERATOR' | 'VIEWER' | 'STAKEHOLDER'

export type ZoneStatus = 'ACTIVE' | 'ALERT' | 'BREACH' | 'INACTIVE'

export type CheckpointCondition = 'INTACT' | 'ANOMALY' | 'BREACH'

export type AnchorStatus = 'ANCHORED' | 'PENDING' | 'FAILED'

export type IncidentStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISPUTED'

export type IncidentType = 'ENCROACHMENT' | 'WILDLIFE_CROSSING' | 'DAMAGE' | 'FIRE' | 'OTHER'

export type MissionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABORTED' | 'INCOMPLETE'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  hederaAccountId?: string
  assignedZoneIds?: string[]
}

export interface Checkpoint {
  id: string
  zoneId: string
  name: string
  sequenceNumber: number
  latitude: number
  longitude: number
  lastCondition?: CheckpointCondition
  lastInspectedAt?: string
}

export interface Zone {
  id: string
  name: string
  region: string
  state: string
  status: ZoneStatus
  riskScore: number
  lengthKm: number
  checkpointCount: number
  lastInspectedAt?: string
  boundaryCoordinates: Array<[number, number]>
  checkpoints: Checkpoint[]
  stakeholderIds: string[]
  assignedOperatorIds: string[]
  patrolsThisWeek: number
  openAlerts: number
}

export interface InspectionRecord {
  id: string
  missionId: string
  zoneId: string
  checkpointId: string
  operatorId: string
  capturedAt: string
  latitude: number
  longitude: number
  gpsAccuracy: number
  condition: CheckpointCondition
  notes?: string
  imageUrl: string
  imageHash?: string
  evidenceHash?: string
  anchorStatus: AnchorStatus
  hederaTopicId?: string
  hederaTransactionId?: string
  hederaConsensusTimestamp?: string
  hederaSequenceNumber?: number
}

export interface Mission {
  id: string
  zoneId: string
  operatorId: string
  status: MissionStatus
  startedAt?: string
  completedAt?: string
  scheduledFor?: string
  checkpointCount: number
  completedCheckpoints: number
  currentCheckpointIndex?: number
  records: string[]
}

export interface Incident {
  id: string
  zoneId: string
  type: IncidentType
  status: IncidentStatus
  reportedAt: string
  reportedBy: string
  description: string
  damageEstimate?: number
  linkedRecordIds: string[]
  resolvedAt?: string
}

export interface Alert {
  id: string
  type: 'BREACH' | 'ANOMALY' | 'MISSED_PATROL' | 'HCS_PENDING' | 'RESOLVED'
  zoneId?: string
  checkpointId?: string
  recordId?: string
  message: string
  timestamp: string
  acknowledged: boolean
}

export interface HCSInspectionPayload {
  recordId: string
  imageHash: string
  zoneId: string
  checkpointId: string
  missionId: string
  capturedAt: string
  latitude: number
  longitude: number
  condition: CheckpointCondition
  operatorAccountId: string
}

export interface HCSMessage {
  sequenceNumber: number
  consensusTimestamp: string
  message: string
  transactionId: string
}

export interface WalletState {
  accountId: string | null
  balance: number | null
  network: 'testnet' | 'mainnet' | null
  status: 'NOT_CONNECTED' | 'CONNECTING' | 'AWAITING_APPROVAL' | 'CONNECTED' | 'WRONG_NETWORK' | 'ERROR'
  error?: string
}
