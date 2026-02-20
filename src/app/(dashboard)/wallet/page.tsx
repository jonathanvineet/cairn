'use client'
import { useState } from 'react'
import { useWalletStore } from '@/stores/walletStore'
import { ConnectWallet } from '@/components/wallet/ConnectWallet'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { DEMO_RECORDS } from '@/lib/placeholder'
import { formatTimestamp, formatHBAR } from '@/lib/utils/format'
import { ExternalLink, RefreshCw, Loader2 } from 'lucide-react'

const HCS_INSPECTION_TOPIC = '0.0.4567890'
const HCS_ALERT_TOPIC = '0.0.4567891'

export default function WalletPage() {
  const { accountId, balance, network, status } = useWalletStore()
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  const pendingRecords = DEMO_RECORDS.filter(r => r.anchorStatus === 'PENDING')
  const recentAnchored = DEMO_RECORDS.filter(r => r.anchorStatus === 'ANCHORED' && r.hederaTransactionId).slice(0, 10)

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    await new Promise(r => setTimeout(r, 2000))
    setTestResult(`0.0.4567890@${Math.floor(Date.now() / 1000)}.000`)
    setTesting(false)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wallet & Hedera Connection</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your Hedera wallet and HCS configuration</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Wallet Status</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <ConnectWallet />
          {status === 'CONNECTED' && accountId && (
            <div className="grid grid-cols-2 gap-4 text-sm border-t border-gray-100 pt-4">
              <div>
                <span className="text-gray-500">Account</span>
                <div className="font-mono font-semibold text-gray-900 mt-0.5">{accountId}</div>
              </div>
              <div>
                <span className="text-gray-500">Balance</span>
                <div className="font-semibold text-gray-900 mt-0.5">{balance !== null ? formatHBAR(balance) : '—'}</div>
              </div>
              <div>
                <span className="text-gray-500">Network</span>
                <div className="mt-0.5">
                  <Badge variant={network === 'mainnet' ? 'success' : 'warning'}>
                    {network?.toUpperCase() ?? '—'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>HCS Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {[
              { label: 'Inspection Topic ID', value: HCS_INSPECTION_TOPIC },
              { label: 'Alert Topic ID', value: HCS_ALERT_TOPIC },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">{label}</div>
                  <div className="font-mono font-medium text-gray-900">{value}</div>
                </div>
                <a
                  href={`https://hashscan.io/testnet/topic/${value}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:text-teal-700"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-4">
            <Button variant="outline" size="sm" onClick={handleTest} disabled={testing}>
              {testing ? <><Loader2 size={13} className="animate-spin" /> Testing...</> : 'Test Submission'}
            </Button>
            {testResult && (
              <div className="mt-2 text-xs text-teal-700 bg-teal-50 p-2 rounded font-mono">
                ✓ Test TX: {testResult}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {pendingRecords.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pending Anchors ({pendingRecords.length})</CardTitle>
              <Button variant="outline" size="sm">
                <RefreshCw size={13} />
                Retry All Failed
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingRecords.map(r => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <div className="text-sm font-medium text-gray-900">{r.id}</div>
                  <div className="text-xs text-gray-400">{r.condition} · {r.capturedAt}</div>
                </div>
                <Badge variant="warning">PENDING</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Recent HCS Activity</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentAnchored.map(r => (
              <div key={r.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                <div className="font-mono text-xs text-gray-600 truncate flex-1">{r.hederaTransactionId}</div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <span className="text-xs text-gray-400">{r.hederaConsensusTimestamp ? formatTimestamp(r.hederaConsensusTimestamp) : '—'}</span>
                  <Badge variant="info">ANCHORED</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
