'use client'
import { useState, useCallback } from 'react'
import type { HCSInspectionPayload } from '@/types'

export function useHCS() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitInspection = useCallback(async (payload: HCSInspectionPayload) => {
    setSubmitting(true)
    setError(null)
    try {
      const response = await fetch('/api/hedera/submit-inspection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? 'Submission failed')
      }
      return await response.json()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      throw err
    } finally {
      setSubmitting(false)
    }
  }, [])

  return { submitInspection, submitting, error }
}
