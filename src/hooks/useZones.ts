'use client'
import { useState, useEffect } from 'react'
import { DEMO_ZONES } from '@/lib/placeholder'
import type { Zone } from '@/types'

export function useZones() {
  const [zones, setZones] = useState<Zone[]>(DEMO_ZONES)
  const [loading, setLoading] = useState(false)
  return { zones, loading }
}

export function useZone(zoneId: string) {
  const zone = DEMO_ZONES.find(z => z.id === zoneId) ?? null
  return { zone, loading: false }
}
