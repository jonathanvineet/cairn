import { create } from 'zustand'
import { Mission, InspectionRecord } from '@/types/inspection.types'

interface PatrolState {
  activeMission: Mission | null
  currentCheckpointIndex: number
  capturedRecords: InspectionRecord[]
  pendingAnchors: string[]
  startMission: (mission: Mission) => void
  completeMission: () => void
  advanceCheckpoint: () => void
  addRecord: (record: InspectionRecord) => void
  markAnchored: (recordId: string, txId: string) => void
}

export const usePatrolStore = create<PatrolState>((set) => ({
  activeMission: null,
  currentCheckpointIndex: 0,
  capturedRecords: [],
  pendingAnchors: [],
  startMission: (mission) =>
    set({ activeMission: mission, currentCheckpointIndex: 0, capturedRecords: [] }),
  completeMission: () =>
    set({ activeMission: null, currentCheckpointIndex: 0 }),
  advanceCheckpoint: () =>
    set((state) => ({ currentCheckpointIndex: state.currentCheckpointIndex + 1 })),
  addRecord: (record) =>
    set((state) => ({
      capturedRecords: [...state.capturedRecords, record],
      pendingAnchors: [...state.pendingAnchors, record.id],
    })),
  markAnchored: (recordId) =>
    set((state) => ({
      pendingAnchors: state.pendingAnchors.filter((id) => id !== recordId),
    })),
}))
