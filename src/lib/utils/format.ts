import { format, formatDistanceToNow } from 'date-fns'

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'dd MMM yyyy')
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), 'dd MMM yyyy, HH:mm')
}

export function formatRelative(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(6)}°N, ${lng.toFixed(6)}°E`
}

export function formatHash(hash: string, chars: number = 8): string {
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`
}

export function formatDistance(km: number): string {
  if (km < 1) return `${(km * 1000).toFixed(0)}m`
  return `${km.toFixed(1)}km`
}
