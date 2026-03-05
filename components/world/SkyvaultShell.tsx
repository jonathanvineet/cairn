'use client'
import Link from 'next/link'
import { ReactNode } from 'react'
import { Shield } from 'lucide-react'

interface SkyvaultShellProps {
  children: ReactNode
  title?: string
}

export default function SkyvaultShell({ children, title }: SkyvaultShellProps) {
  return (
    <div style={{ minHeight: '100vh', position: 'relative', background: '#050810', color: '#fff', fontFamily: 'Rajdhani, sans-serif', overflowX: 'hidden' }}>

      {/* Pure CSS Background — no WebGL */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'linear-gradient(180deg, #050810 0%, #0a1628 50%, #050810 100%)' }} />

      {/* Subtle grid */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
        backgroundImage: `linear-gradient(rgba(0,245,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.025) 1px, transparent 1px)`,
        backgroundSize: '80px 80px',
      }} />

      {/* Vignette + Scanlines */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none', background: 'radial-gradient(circle at center, transparent 40%, rgba(5,8,16,0.6) 100%)' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 3, pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,245,255,0.008) 2px, rgba(0,245,255,0.008) 4px)' }} />

      {/* Top HUD Bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 60,
        background: 'rgba(5,8,16,0.85)', borderBottom: '1px solid rgba(0,245,255,0.15)',
        backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', padding: '0 32px', gap: 20
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.4)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={18} color="#00f5ff" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#00f5ff', fontSize: 13, fontWeight: 700, letterSpacing: '0.4em', lineHeight: 1 }}>CAIRN</span>
            <span style={{ color: 'rgba(0,245,255,0.4)', fontSize: 9, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Airspace Registry // Hedera Testnet</span>
          </div>
        </Link>

        <div style={{ height: 24, width: 1, background: 'rgba(255,255,255,0.1)' }} />
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          {title ?? 'Command Center'}
        </span>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {[
            { href: '/dashboard', label: 'Dashboard', color: '#8b5cf6' },
            { href: '/register', label: 'Register', color: '#00f5ff' },
            { href: '/deploy', label: 'Deploy', color: '#10b981' },
          ].map(({ href, label, color }) => (
            <Link key={href} href={href} style={{
              color, fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
              textDecoration: 'none', padding: '5px 14px',
              background: `${color}10`, border: `1px solid ${color}25`,
              borderRadius: 4, transition: 'all 0.2s ease'
            }}>{label}</Link>
          ))}
        </div>
      </div>

      {/* Corner Decorations */}
      <div style={{ position: 'fixed', top: 76, left: 32, zIndex: 10, width: 60, height: 60, pointerEvents: 'none', borderTop: '1px solid rgba(0,245,255,0.4)', borderLeft: '1px solid rgba(0,245,255,0.4)' }} />
      <div style={{ position: 'fixed', top: 76, right: 32, zIndex: 10, width: 60, height: 60, pointerEvents: 'none', borderTop: '1px solid rgba(0,245,255,0.4)', borderRight: '1px solid rgba(0,245,255,0.4)' }} />
      <div style={{ position: 'fixed', bottom: 32, left: 32, zIndex: 10, width: 60, height: 60, pointerEvents: 'none', borderBottom: '1px solid rgba(0,245,255,0.4)', borderLeft: '1px solid rgba(0,245,255,0.4)' }} />
      <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 10, width: 60, height: 60, pointerEvents: 'none', borderBottom: '1px solid rgba(0,245,255,0.4)', borderRight: '1px solid rgba(0,245,255,0.4)' }} />

      {/* Page Content */}
      <div style={{ position: 'relative', zIndex: 20, paddingTop: 80, paddingBottom: 40, minHeight: '100vh' }}>
        {children}
      </div>
    </div>
  )
}
