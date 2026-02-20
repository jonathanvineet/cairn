import { notFound } from 'next/navigation'
import { getRecordById, getCheckpointById, getZoneById, getMissionById, getUserById } from '@/lib/placeholder'
import { ConditionBadge, AnchorBadge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatTimestamp, formatGPS, formatHash } from '@/lib/utils/format'
import { Copy, ExternalLink, FileText, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function EvidenceRecordPage({ params }: { params: { recordId: string } }) {
  const record = getRecordById(params.recordId)
  if (!record) notFound()

  const checkpoint = getCheckpointById(record.checkpointId)
  const zone = getZoneById(record.zoneId)
  const mission = getMissionById(record.missionId)
  const operator = getUserById(record.operatorId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/evidence" className="text-sm text-gray-500 hover:text-gray-700">← Evidence Vault</Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Evidence Record</h1>
          <p className="text-sm text-gray-500 mt-1 font-mono">{record.id}</p>
        </div>
        <Link href={`/evidence/certificate/${record.id}`}>
          <Button variant="outline" size="sm">
            <FileText size={14} />
            Generate Certificate
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className={`aspect-video rounded-xl ${
            record.condition === 'INTACT' ? 'bg-green-50' : record.condition === 'ANOMALY' ? 'bg-amber-50' : 'bg-red-50'
          } flex items-center justify-center`}>
            <div className="text-center">
              <div className="text-6xl mb-3">
                {record.condition === 'INTACT' ? '🟢' : record.condition === 'ANOMALY' ? '🟡' : '🔴'}
              </div>
              <ConditionBadge condition={record.condition} />
            </div>
          </div>

          {record.imageHash && (
            <Card>
              <CardContent className="pt-4">
                <div className="text-xs text-gray-500 mb-1">Image Hash (SHA-256)</div>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded flex-1 break-all">
                    {record.imageHash}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(record.imageHash!)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Metadata</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Record ID', value: record.id },
                  { label: 'Mission ID', value: record.missionId },
                  { label: 'Zone', value: zone?.name ?? record.zoneId },
                  { label: 'Checkpoint', value: checkpoint?.name ?? record.checkpointId },
                  { label: 'Captured At', value: formatTimestamp(record.capturedAt) + ' (System time)' },
                  { label: 'Operator', value: operator?.name ?? record.operatorId },
                  { label: 'GPS Coordinates', value: formatGPS(record.latitude, record.longitude) },
                  { label: 'GPS Accuracy', value: `±${record.gpsAccuracy}m` },
                  { label: 'Condition', value: record.condition },
                  { label: 'Anchor Status', value: record.anchorStatus },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="text-gray-500 text-xs">{label}</div>
                    <div className="font-medium text-gray-900 mt-0.5">{value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card accent="hedera">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Hedera Anchor</CardTitle>
                <AnchorBadge status={record.anchorStatus} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {record.anchorStatus === 'ANCHORED' ? (
                <>
                  <div>
                    <div className="text-xs text-gray-500">HCS Topic ID</div>
                    <div className="text-sm font-mono font-medium">{record.hederaTopicId}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Transaction ID</div>
                    <div className="flex items-center gap-1">
                      <div className="text-xs font-mono text-gray-700 flex-1 break-all">{record.hederaTransactionId}</div>
                      <button onClick={() => navigator.clipboard.writeText(record.hederaTransactionId!)} className="text-gray-400 hover:text-gray-600">
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Consensus Timestamp (Hedera time)</div>
                    <div className="text-sm font-medium text-teal-700">
                      {record.hederaConsensusTimestamp ? formatTimestamp(record.hederaConsensusTimestamp) : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Sequence Number</div>
                    <div className="text-sm font-medium">#{record.hederaSequenceNumber}</div>
                  </div>
                  {record.evidenceHash && (
                    <div>
                      <div className="text-xs text-gray-500">Evidence Hash</div>
                      <div className="text-xs font-mono text-gray-600 break-all">{formatHash(record.evidenceHash)}</div>
                    </div>
                  )}
                  <a
                    href={`https://hashscan.io/testnet/transaction/${record.hederaTransactionId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      <ExternalLink size={12} />
                      Verify on Hedera
                    </Button>
                  </a>
                </>
              ) : (
                <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
                  <p className="font-semibold">Not yet anchored</p>
                  <p className="text-xs mt-1">This record is PENDING — it is not yet tamper-proof. Anchoring to Hedera is in progress.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Chain of Custody</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Captured by</span>
                <span className="font-medium">{operator?.name ?? record.operatorId}</span>
              </div>
              {operator?.hederaAccountId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Account</span>
                  <span className="font-mono text-xs">{operator.hederaAccountId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Submitted at</span>
                <span className="font-medium text-xs">{formatTimestamp(record.capturedAt)}</span>
              </div>
              {record.hederaConsensusTimestamp && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Anchored at</span>
                  <span className="font-medium text-xs text-teal-700">{formatTimestamp(record.hederaConsensusTimestamp)}</span>
                </div>
              )}
              {record.anchorStatus === 'ANCHORED' && (
                <div className="flex items-center gap-1 text-green-600 text-xs font-medium pt-1">
                  <CheckCircle size={12} />
                  Hash verified ✓
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
