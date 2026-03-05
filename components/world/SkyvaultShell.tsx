'use client'
import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

// Dynamically import to avoid SSR issues with Three.js Canvas
const SceneBackground = dynamic(() => import('./SceneBackground'), { ssr: false })

interface SkyvaultShellProps {
  children: ReactNode
  title?: string
}

export default function SkyvaultShell({ children, title }: SkyvaultShellProps) {
  return (
    <div style={{ minHeight: '100vh', position: 'relative', fontFamily: 'Rajdhani, sans-serif' }}>

      {/* 3D Background */}
      <SceneBackground />

      {/* Top HUD Bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20,
        height: 48,
        background: 'rgba(5,8,16,0.85)',
        borderBottom: '1px solid rgba(0,245,255,0.2)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center',
        padding: '0 24px', gap: 16
      }}>
        <span style={{ color: '#00f5ff', fontSize: 13, fontWeight: 700, letterSpacing: '0.3em' }}>
          SKYVAULT OPS
        </span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>//</span>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: '0.2em' }}>
          {title?.toUpperCase() ?? 'COMMAND CENTER'}
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <a href="/dashboard" style={{
            color: '#00f5ff', fontSize: 10, letterSpacing: '0.2em',
            textDecoration: 'none', padding: '4px 12px',
            border: '1px solid rgba(0,245,255,0.3)',
            borderRadius: 2
          }}>← DASHBOARD</a>
        </div>
      </div>

      {/* Scan line overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,245,255,0.015) 2px, rgba(0,245,255,0.015) 4px)'
      }} />

      {/* Corner decorations */}
      <div style={{
        position: 'fixed', top: 56, left: 16, zIndex: 10,
        width: 60, height: 60, pointerEvents: 'none',
        borderTop: '2px solid rgba(0,245,255,0.4)',
        borderLeft: '2px solid rgba(0,245,255,0.4)'
      }} />
      <div style={{
        position: 'fixed', top: 56, right: 16, zIndex: 10,
        width: 60, height: 60, pointerEvents: 'none',
        borderTop: '2px solid rgba(0,245,255,0.4)',
        borderRight: '2px solid rgba(0,245,255,0.4)'
      }} />
      <div style={{
        position: 'fixed', bottom: 16, left: 16, zIndex: 10,
        width: 60, height: 60, pointerEvents: 'none',
        borderBottom: '2px solid rgba(0,245,255,0.4)',
        borderLeft: '2px solid rgba(0,245,255,0.4)'
      }} />
      <div style={{
        position: 'fixed', bottom: 16, right: 16, zIndex: 10,
        width: 60, height: 60, pointerEvents: 'none',
        borderBottom: '2px solid rgba(0,245,255,0.4)',
        borderRight: '2px solid rgba(0,245,255,0.4)'
      }} />

      {/* Page Content */}
      <div style={{
        position: 'relative', zIndex: 10,
        paddingTop: 64,
        minHeight: '100vh'
      }}>
        {children}
      </div>
    </div>
  )
}
