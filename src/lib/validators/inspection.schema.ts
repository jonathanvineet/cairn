import { z } from 'zod'

export const inspectionSchema = z.object({
  checkpointId: z.string().min(1, 'Checkpoint is required'),
  condition: z.enum(['INTACT', 'ANOMALY', 'BREACH']),
  latitude: z.number(),
  longitude: z.number(),
  gpsAccuracy: z.number().positive(),
  imageHash: z.string().min(1, 'Image hash is required'),
  notes: z.string().optional(),
})

export type InspectionFormData = z.infer<typeof inspectionSchema>
