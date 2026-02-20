'use client'
import { useState, useRef } from 'react'
import { usePatrolStore } from '@/stores/patrolStore'
import { getZoneById } from '@/lib/placeholder'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { formatGPS } from '@/lib/utils/format'
import { Camera, MapPin, CheckCircle, Loader2, AlertTriangle } from 'lucide-react'
import type { CheckpointCondition } from '@/types'

type SubmitState = 'idle' | 'hashing' | 'submitting' | 'anchoring' | 'done' | 'error'

export default function CheckpointSubmitPage() {
  const { activeMission, advanceCheckpoint } = usePatrolStore()
  const [imageCaptured, setImageCaptured] = useState(false)
  const [gpsLocked] = useState(true)
  const [condition, setCondition] = useState<CheckpointCondition | null>(null)
  const [notes, setNotes] = useState('')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [txId, setTxId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const zone = activeMission ? getZoneById(activeMission.zoneId) : null
  const currentCp = zone?.checkpoints[activeMission?.currentCheckpointIndex ?? 0]

  const canSubmit = imageCaptured && gpsLocked && condition !== null && submitState === 'idle'

  const handleCapture = () => {
    fileRef.current?.click()
  }

  const handleFileChange = () => {
    if (fileRef.current?.files?.length) {
      setImageCaptured(true)
    }
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitState('hashing')
    await new Promise(r => setTimeout(r, 800))
    setSubmitState('submitting')
    await new Promise(r => setTimeout(r, 600))
    setSubmitState('anchoring')
    await new Promise(r => setTimeout(r, 1200))
    setTxId(`0.0.4567890@${Math.floor(Date.now() / 1000)}.000`)
    setSubmitState('done')
  }

  const handleNext = () => {
    advanceCheckpoint()
    setImageCaptured(false)
    setCondition(null)
    setNotes('')
    setSubmitState('idle')
    setTxId(null)
  }

  if (!activeMission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertTriangle size={40} className="text-amber-400 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900">No Active Mission</h2>
        <p className="text-gray-500 text-sm mt-2">Start a patrol from the Field Operations page</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500">{activeMission.id} · {zone?.name}</div>
          <div className="font-bold text-gray-900">Checkpoint {(activeMission.currentCheckpointIndex ?? 0) + 1} of {activeMission.checkpointCount}</div>
        </div>
        <div className="text-right text-xs">
          <div className={`font-semibold ${gpsLocked ? 'text-green-600' : 'text-amber-600'}`}>
            {gpsLocked ? 'GPS Lock: ±2.3m' : 'Acquiring...'}
          </div>
          {currentCp && <div className="text-gray-400">{formatGPS(currentCp.latitude, currentCp.longitude)}</div>}
        </div>
      </div>

      <div
        onClick={handleCapture}
        className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
          imageCaptured ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-forest-400'
        }`}
      >
        {imageCaptured ? (
          <>
            <CheckCircle size={48} className="text-green-500" />
            <span className="text-sm text-green-700 font-medium mt-2">Image captured</span>
            <span className="text-xs text-gray-500 mt-1">Tap to replace</span>
          </>
        ) : (
          <>
            <Camera size={48} className="text-gray-300" />
            <span className="text-sm text-gray-500 mt-2">Tap to capture or upload</span>
            <span className="text-xs text-gray-400 mt-1">Must be within 10m of GPS point</span>
          </>
        )}
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {([
          { value: 'INTACT', emoji: '🟢', label: 'INTACT', desc: 'Fully intact, no issues' },
          { value: 'ANOMALY', emoji: '🟡', label: 'ANOMALY', desc: 'Needs attention' },
          { value: 'BREACH', emoji: '🔴', label: 'BREACH', desc: 'Immediate alert' },
        ] as const).map(opt => (
          <button
            key={opt.value}
            onClick={() => setCondition(opt.value)}
            className={`p-3 rounded-xl border-2 text-center transition-all ${
              condition === opt.value ? 'border-forest-600 bg-forest-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl">{opt.emoji}</div>
            <div className="text-xs font-bold mt-1">{opt.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{opt.desc}</div>
          </button>
        ))}
      </div>

      <textarea
        placeholder="Optional notes (max 200 chars)"
        value={notes}
        onChange={e => setNotes(e.target.value.slice(0, 200))}
        className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-forest-500"
        rows={2}
      />

      {submitState === 'done' && txId ? (
        <Card accent="hedera">
          <CardContent className="pt-4 space-y-2">
            <div className="flex items-center gap-2 text-teal-700">
              <CheckCircle size={18} />
              <span className="font-semibold">Anchored to Hedera</span>
            </div>
            <div className="text-xs font-mono text-gray-600 break-all">{txId}</div>
            <p className="text-xs text-gray-500">Hedera Consensus Time — immutable record</p>
            <Button onClick={handleNext} className="w-full mt-2">
              Next Checkpoint →
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Button
          disabled={!canSubmit}
          onClick={handleSubmit}
          size="lg"
          className="w-full"
        >
          {submitState === 'hashing' && <><Loader2 size={16} className="animate-spin" /> Hashing image...</>}
          {submitState === 'submitting' && <><Loader2 size={16} className="animate-spin" /> Submitting...</>}
          {submitState === 'anchoring' && <><Loader2 size={16} className="animate-spin" /> Anchoring to Hedera...</>}
          {submitState === 'idle' && 'Capture & Anchor Evidence'}
        </Button>
      )}
    </div>
  )
}
