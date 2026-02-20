import { z } from 'zod'

export const checkpointSchema = z.object({
  name: z.string().min(2, 'Checkpoint name is required'),
  sequenceNumber: z.number().int().positive(),
  latitude: z.number(),
  longitude: z.number(),
  isHighRisk: z.boolean().default(false),
})

export type CheckpointFormData = z.infer<typeof checkpointSchema>
