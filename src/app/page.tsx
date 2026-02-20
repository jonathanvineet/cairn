import Link from 'next/link'
import { Shield, Map, Archive, BarChart2, CheckCircle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-forest-900 text-white">
      <header className="px-8 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">cairn</h1>
          <p className="text-forest-300 text-sm">Forest Boundary Intelligence</p>
        </div>
        <Link
          href="/dashboard"
          className="bg-forest-600 hover:bg-forest-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Enter Dashboard
        </Link>
      </header>

      <main className="px-8 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">Tamper-proof forest boundary evidence</h2>
          <p className="text-forest-300 text-xl max-w-2xl mx-auto">
            Field-captured inspection evidence anchored immutably to the Hedera blockchain.
            Section 65B compliant certificates for legal enforcement.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-forest-600 hover:bg-forest-500 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Open Dashboard
            </Link>
            <Link
              href="/patrol"
              className="border border-forest-600 text-forest-300 hover:bg-forest-800 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Start Patrol
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Map, label: 'Boundary Zones', desc: 'Monitor all assigned zones' },
            { icon: Shield, label: 'Field Patrol', desc: 'Mobile-first capture UI' },
            { icon: Archive, label: 'Evidence Vault', desc: 'Hedera-anchored records' },
            { icon: BarChart2, label: 'Analytics', desc: 'Risk trends & insights' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-forest-800 rounded-xl p-5">
              <Icon className="text-forest-300 mb-3" size={28} />
              <div className="font-semibold">{label}</div>
              <div className="text-forest-400 text-sm mt-1">{desc}</div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-forest-800 rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-4">How it works</h3>
          <div className="space-y-3">
            {[
              'Operator captures checkpoint photo within 10m GPS radius',
              'Image hashed locally with SHA-256 — never altered',
              'Evidence record submitted to Hedera Consensus Service',
              'Immutable consensus timestamp proves when inspection occurred',
              'Section 65B certificate generated from anchored record',
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle size={16} className="text-forest-400 shrink-0" />
                <span className="text-forest-200 text-sm">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
