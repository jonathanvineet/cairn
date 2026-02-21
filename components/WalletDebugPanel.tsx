'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

export function WalletDebugPanel() {
  const [debugInfo, setDebugInfo] = useState<string>('')

  const refresh = () => {
    const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    
    const info = `
📊 Environment Check:
  - Project ID: ${projectId ? `✅ Set (${projectId.slice(0, 8)}...${projectId.slice(-4)})` : '❌ NOT SET'}
  - App URL: ${appUrl || 'localhost:3000'}
  - Client Side: ${typeof window !== 'undefined' ? '✅ Yes' : '❌ No'}

💡 Open browser console (F12) to see detailed connection logs looking for:
  - 🔵 [1/6] through 🔵 [6/6] - connection flow progress
  - ✅ Success markers
  - 🔴 Error markers with troubleshooting tips
    `
    setDebugInfo(info)
  }

  useEffect(() => {
    refresh()
  }, [])

  return (
    <Card className="border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-lg">Debug Info</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <pre className="text-xs whitespace-pre-wrap font-mono">{debugInfo}</pre>
      </CardContent>
    </Card>
  )
}
