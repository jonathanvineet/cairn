import { create } from 'zustand'

interface Alert {
  id: string
  type: 'ANOMALY' | 'BREACH' | 'INFO'
  message: string
  zoneId: string
  timestamp: Date
  read: boolean
}

interface AlertState {
  alerts: Alert[]
  unreadCount: number
  addAlert: (alert: Omit<Alert, 'id' | 'read'>) => void
  markRead: (alertId: string) => void
  markAllRead: () => void
  clearAlerts: () => void
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  unreadCount: 0,
  addAlert: (alert) =>
    set((state) => {
      const newAlert = { ...alert, id: crypto.randomUUID(), read: false }
      return {
        alerts: [newAlert, ...state.alerts],
        unreadCount: state.unreadCount + 1,
      }
    }),
  markRead: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map((a) => a.id === alertId ? { ...a, read: true } : a),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  markAllRead: () =>
    set((state) => ({
      alerts: state.alerts.map((a) => ({ ...a, read: true })),
      unreadCount: 0,
    })),
  clearAlerts: () => set({ alerts: [], unreadCount: 0 }),
}))
