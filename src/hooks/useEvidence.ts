'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { InspectionRecord } from '@/types/inspection.types'

export function useEvidence(recordId?: string) {
  return useQuery<InspectionRecord>({
    queryKey: ['evidence', recordId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/inspections/${recordId}`)
      return data
    },
    enabled: !!recordId,
  })
}

export function useEvidenceList(zoneId?: string) {
  return useQuery<InspectionRecord[]>({
    queryKey: ['evidence', 'list', zoneId],
    queryFn: async () => {
      const url = zoneId ? `/api/inspections?zoneId=${zoneId}` : '/api/inspections'
      const { data } = await axios.get(url)
      return data
    },
  })
}
