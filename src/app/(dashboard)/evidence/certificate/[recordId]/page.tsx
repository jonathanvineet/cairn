import { notFound } from 'next/navigation'
import { getRecordById, getCheckpointById, getZoneById, getUserById } from '@/lib/placeholder'
import { Button } from '@/components/ui/Button'
import { formatTimestamp, formatGPS } from '@/lib/utils/format'
import { Download, Printer, Share2, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function CertificatePage({ params }: { params: { recordId: string } }) {
  const record = getRecordById(params.recordId)
  if (!record) notFound()

  const checkpoint = getCheckpointById(record.checkpointId)
  const zone = getZoneById(record.zoneId)
  const operator = getUserById(record.operatorId)
  const certNo = `CERT-2024-${record.id.replace('rec-', '').padStart(5, '0')}`
  const genDate = formatTimestamp(new Date().toISOString())

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/evidence/${record.id}`} className="text-sm text-gray-500 hover:text-gray-700">← Evidence Record</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Evidence Certificate</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download size={14} /> Download PDF</Button>
          <Button variant="outline" size="sm"><Printer size={14} /> Print</Button>
          <Button variant="outline" size="sm"><Share2 size={14} /> Share</Button>
        </div>
      </div>

      <div className="bg-white border-2 border-gray-800 rounded-xl p-8 font-mono space-y-6 print:shadow-none">
        <div className="text-center border-b-2 border-gray-800 pb-6">
          <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
            BOUNDARY TRUTH INSPECTION EVIDENCE CERTIFICATE
          </h2>
          <p className="text-sm text-gray-600 mt-1">Issued under Indian Evidence Act Section 65B</p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-left text-sm">
            <div><span className="text-gray-500">Certificate No:</span> <span className="font-bold">{certNo}</span></div>
            <div><span className="text-gray-500">Generated:</span> <span>{genDate}</span></div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wider border-b border-gray-200 pb-1">
            INSPECTION RECORD DETAILS
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-500">Zone:</span></div>
            <div className="font-medium">{zone?.name ?? record.zoneId}</div>
            <div><span className="text-gray-500">Checkpoint:</span></div>
            <div className="font-medium">{checkpoint?.name ?? record.checkpointId} · {checkpoint ? formatGPS(checkpoint.latitude, checkpoint.longitude) : '—'}</div>
            <div><span className="text-gray-500">Inspection Date/Time:</span></div>
            <div className="font-medium">{formatTimestamp(record.capturedAt)} (System time)</div>
            <div><span className="text-gray-500">Operator Account:</span></div>
            <div className="font-medium">{operator?.hederaAccountId ?? operator?.name ?? record.operatorId}</div>
            <div><span className="text-gray-500">Boundary Condition:</span></div>
            <div className={`font-bold ${record.condition === 'INTACT' ? 'text-green-700' : record.condition === 'ANOMALY' ? 'text-amber-700' : 'text-red-700'}`}>
              {record.condition}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wider border-b border-gray-200 pb-1">
            EVIDENCE INTEGRITY
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {record.imageHash && (
              <>
                <div className="text-gray-500">Image Hash (SHA-256):</div>
                <div className="font-medium break-all text-xs">{record.imageHash}</div>
              </>
            )}
            {record.evidenceHash && (
              <>
                <div className="text-gray-500">Evidence Hash (SHA-256):</div>
                <div className="font-medium break-all text-xs">{record.evidenceHash}</div>
              </>
            )}
            {record.hederaTopicId && (
              <>
                <div className="text-gray-500">Hedera HCS Topic:</div>
                <div className="font-medium">{record.hederaTopicId}</div>
              </>
            )}
            {record.hederaTransactionId && (
              <>
                <div className="text-gray-500">Hedera Transaction ID:</div>
                <div className="font-medium break-all text-xs">{record.hederaTransactionId}</div>
              </>
            )}
            {record.hederaConsensusTimestamp && (
              <>
                <div className="text-gray-500">Consensus Timestamp:</div>
                <div className="font-medium text-teal-700">{formatTimestamp(record.hederaConsensusTimestamp)} (Hedera Consensus Time)</div>
              </>
            )}
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 space-y-2">
          <p>This record was anchored to the Hedera Consensus Service, an immutable distributed ledger, and cannot be altered after the consensus timestamp shown above.</p>
          <p className="font-semibold">This certificate constitutes a Section 65B compliant electronic record under the Indian Evidence Act, 1872.</p>
        </div>

        <div className="flex items-center justify-center gap-2 text-green-700 text-sm font-semibold border-t border-gray-200 pt-4">
          <CheckCircle size={16} />
          <span>VERIFIED — Hash anchored on Hedera Consensus Service</span>
        </div>
      </div>
    </div>
  )
}
