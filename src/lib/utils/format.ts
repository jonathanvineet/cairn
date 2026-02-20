import { formatDistanceToNow, format, differenceInDays } from 'date-fns'

export function formatTimestamp(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, "dd MMM yyyy, HH:mm:ss 'IST'")
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const days = differenceInDays(now, d)
  if (days > 2) {
    return `OVERDUE — ${days} days`
  }
  return formatDistanceToNow(d, { addSuffix: true })
}

export function formatGPS(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S'
  const lonDir = lon >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir}`
}

export function formatHash(hash: string): string {
  if (hash.length <= 8) return hash
  return `${hash.slice(0, 4)}...${hash.slice(-4)}`
}

export function formatHederaTxId(txId: string): string {
  return txId
}

export function formatHBAR(amount: number): string {
  return `${amount.toFixed(2)} ℏ`
}

export function formatKm(km: number): string {
  return `${km.toFixed(1)} km`
}

export function getRiskLabel(score: number): string {
  if (score >= 75) return 'CRITICAL'
  if (score >= 50) return 'HIGH'
  if (score >= 25) return 'MEDIUM'
  return 'LOW'
}

export function getRiskColor(score: number): string {
  if (score >= 75) return 'text-red-600 bg-red-50'
  if (score >= 50) return 'text-orange-600 bg-orange-50'
  if (score >= 25) return 'text-yellow-600 bg-yellow-50'
  return 'text-green-600 bg-green-50'
}
