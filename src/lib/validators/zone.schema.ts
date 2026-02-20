import { z } from 'zod'

export const zoneSchema = z.object({
  name: z.string().min(3, 'Zone name must be at least 3 characters'),
  region: z.string().min(2, 'Region is required'),
  state: z.string().min(2, 'State is required'),
  totalLengthKm: z.number().positive('Length must be positive'),
  coordinates: z.array(z.tuple([z.number(), z.number()])).min(3, 'At least 3 coordinate points required'),
})

export type ZoneFormData = z.infer<typeof zoneSchema>
