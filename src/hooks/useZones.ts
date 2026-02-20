'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { BoundaryZone } from '@/types/zone.types'

export function useZones() {
  return useQuery<BoundaryZone[]>({
    queryKey: ['zones'],
    queryFn: async () => {
      const { data } = await axios.get('/api/zones')
      return data
    },
  })
}

export function useZone(zoneId: string) {
  return useQuery<BoundaryZone>({
    queryKey: ['zones', zoneId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/zones/${zoneId}`)
      return data
    },
    enabled: !!zoneId,
  })
}
