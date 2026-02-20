'use client'

import { usePatrolStore } from '@/stores/patrolStore'

export function usePatrol() {
  const store = usePatrolStore()
  return store
}
