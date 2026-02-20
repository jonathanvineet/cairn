'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface HashDisplayProps {
  hash: string
  label?: string
  truncate?: boolean
}

export function HashDisplay({ hash, label, truncate = true }: HashDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(hash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const display = truncate ? `${hash.slice(0, 10)}...${hash.slice(-10)}` : hash

  return (
    <div className="space-y-1">
      {label && <div className="text-xs text-[#786E5F] uppercase tracking-wider">{label}</div>}
      <div className="flex items-center gap-2 bg-[#0E0A04] border border-[#3C3223] rounded px-3 py-2">
        <code className="text-xs font-mono text-green-400 flex-1 truncate">{display}</code>
        <button onClick={handleCopy} className="text-[#786E5F] hover:text-[#F0EBDC] transition-colors flex-shrink-0">
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  )
}
