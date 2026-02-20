export type UserRole = 
  | 'OPERATOR'
  | 'RANGER'
  | 'ESTATE_OWNER'
  | 'INSURER'
  | 'SUPER_ADMIN'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  walletAddress?: string
  hederaAccountId?: string
  zoneIds: string[]
  createdAt: Date
}
