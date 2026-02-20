'use client'
import { usePatrolStore } from '@/stores/patrolStore'

export function usePatrol() {
  return usePatrolStore()
}
