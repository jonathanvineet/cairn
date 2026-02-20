import Link from 'next/link'
import { Shield, Camera, FileCheck } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#140E04] text-[#F0EBDC]">
      {/* Header */}
      <header className="border-b border-[#3C3223] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-green-500" />
            <span className="text-xl font-bold tracking-tight">BOUNDARY TRUTH</span>
          </div>
          <Link
            href="/dashboard"
            className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            Enter Dashboard
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-green-900/30 border border-green-700/40 text-green-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Hedera Consensus Service — Testnet Active
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Verified Boundary<br />
            <span className="text-green-500">Inspection Evidence</span><br />
            Infrastructure
          </h1>
          <p className="text-[#B4AA96] text-lg leading-relaxed mb-8">
            Tamper-proof, blockchain-anchored inspection evidence for forest and 
            plantation boundary zones. Every patrol checkpoint is cryptographically 
            hashed and anchored to Hedera — creating an immutable audit trail for 
            dispute resolution and insurance claims.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="bg-green-700 hover:bg-green-600 text-white px-6 py-3 rounded font-medium transition-colors"
            >
              Open Dashboard
            </Link>
            <Link
              href="/wallet"
              className="border border-[#3C3223] hover:border-green-700/60 text-[#B4AA96] hover:text-[#F0EBDC] px-6 py-3 rounded font-medium transition-colors"
            >
              Connect Wallet
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-[#3C3223]">
        <h2 className="text-2xl font-bold mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Camera,
              title: 'Field Capture',
              desc: 'Drone operators capture GPS-tagged photos at each checkpoint along the boundary route.',
            },
            {
              icon: Shield,
              title: 'HCS Anchoring',
              desc: 'Each inspection record is hashed and submitted to Hedera Consensus Service for immutable timestamping.',
            },
            {
              icon: FileCheck,
              title: 'Evidence Certificate',
              desc: 'Generate Section 65B-compliant evidence certificates for legal proceedings and insurance claims.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-[#1C140A] border border-[#3C3223] rounded-lg p-6">
              <div className="w-10 h-10 bg-green-900/40 rounded-lg flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-[#B4AA96] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Status indicators */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Boundary Zones', value: '—', status: 'active' },
            { label: 'Inspections Anchored', value: '—', status: 'anchored' },
            { label: 'Active Incidents', value: '—', status: 'breach' },
            { label: 'Evidence Records', value: '—', status: 'intact' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#1C140A] border border-[#3C3223] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{value}</div>
              <div className="text-[#B4AA96] text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#3C3223] px-6 py-8 mt-8">
        <div className="max-w-7xl mx-auto text-center text-[#786E5F] text-sm">
          BoundaryTruth — Forest Boundary Inspection Evidence Platform · Powered by Hedera Consensus Service
        </div>
      </footer>
    </main>
  )
}
