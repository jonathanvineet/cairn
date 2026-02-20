import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Mission } from '@/types'

interface PatrolStore {
  activeMission: Mission | null
  setActiveMission: (mission: Mission | null) => void
  advanceCheckpoint: () => void
  completeMission: () => void
}

export const usePatrolStore = create<PatrolStore>()(
  persist(
    (set, get) => ({
      activeMission: null,
      setActiveMission: (mission) => set({ activeMission: mission }),
      advanceCheckpoint: () => {
        const { activeMission } = get()
        if (!activeMission) return
        const next = (activeMission.currentCheckpointIndex ?? 0) + 1
        set({
          activeMission: {
            ...activeMission,
            currentCheckpointIndex: next,
            completedCheckpoints: next,
          },
        })
      },
      completeMission: () => {
        const { activeMission } = get()
        if (!activeMission) return
        set({
          activeMission: {
            ...activeMission,
            status: 'COMPLETED',
            completedAt: new Date().toISOString(),
          },
        })
      },
    }),
    { name: 'cairn-patrol' }
  )
)
