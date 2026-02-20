'use client'

import { useState } from 'react'

export function useHCS() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitToHCS = async (payload: Record<string, unknown>) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const response = await fetch('/api/hedera/submit-inspection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('Failed to submit to HCS')
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  const verifyHash = async (topicId: string, evidenceHash: string) => {
    const response = await fetch(`/api/hedera/verify-record?topicId=${topicId}&evidenceHash=${evidenceHash}`)
    if (!response.ok) throw new Error('Failed to verify hash')
    return await response.json()
  }

  return { submitToHCS, verifyHash, isSubmitting, error }
}
