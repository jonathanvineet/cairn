'use client'
import { DEMO_RECORDS } from '@/lib/placeholder'
import type { InspectionRecord } from '@/types'

export function useEvidence(filter?: { zoneId?: string; condition?: string }) {
  let records = [...DEMO_RECORDS]
  if (filter?.zoneId) records = records.filter(r => r.zoneId === filter.zoneId)
  if (filter?.condition) records = records.filter(r => r.condition === filter.condition)
  records.sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime())
  return { records, loading: false }
}
