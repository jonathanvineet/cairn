export type IncidentType = 
  | 'ANIMAL_INTRUSION'
  | 'FENCE_BREACH'
  | 'CROP_DAMAGE'
  | 'HUMAN_INTRUSION'
  | 'STRUCTURAL_DAMAGE'
  | 'OTHER'

export interface Incident {
  id: string
  zoneId: string
  reportedBy: string
  reportedAt: Date
  incidentType: IncidentType
  description: string
  latitude?: number
  longitude?: number
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISPUTED'
  linkedInspectionIds: string[]
  linkedEvidenceIds: string[]
  estimatedDamage?: number
  compensationStatus?: string
}
