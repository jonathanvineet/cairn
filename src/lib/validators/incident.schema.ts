import { z } from 'zod'

export const incidentSchema = z.object({
  zoneId: z.string().min(1, 'Zone is required'),
  incidentType: z.enum(['ANIMAL_INTRUSION', 'FENCE_BREACH', 'CROP_DAMAGE', 'HUMAN_INTRUSION', 'STRUCTURAL_DAMAGE', 'OTHER']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  estimatedDamage: z.number().optional(),
})

export type IncidentFormData = z.infer<typeof incidentSchema>
