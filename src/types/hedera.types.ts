import { ConditionClassification } from './inspection.types'

export interface HCSMessage {
  topicId: string
  message: HCSInspectionPayload
  transactionId: string
  consensusTimestamp: Date
  sequenceNumber: number
}

export interface HCSInspectionPayload {
  appVersion: string
  recordId: string
  zoneId: string
  checkpointId: string
  missionId: string
  capturedAt: string
  latitude: number
  longitude: number
  condition: ConditionClassification
  evidenceHash: string
  operatorAccountId: string
}
