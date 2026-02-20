'use client'

import { Shield, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { useWallet } from '@/hooks/useWallet'

export default function LoginPage() {
  const { connectWallet } = useWallet()

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 bg-green-900/40 rounded-full flex items-center justify-center">
            <Shield className="w-7 h-7 text-green-500" />
          </div>
        </div>
        <CardTitle className="text-lg">BOUNDARY TRUTH</CardTitle>
        <p className="text-xs text-[#786E5F]">Evidence Infrastructure Platform</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={connectWallet} className="w-full" size="lg">
          <Wallet className="w-4 h-4 mr-2" />
          Connect HashPack Wallet
        </Button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#3C3223]" />
          </div>
          <div className="relative flex justify-center text-xs text-[#786E5F] bg-[#1C140A] px-2">or</div>
        </div>
        <div className="space-y-3">
          <Input type="email" placeholder="Email address" />
          <Input type="password" placeholder="Password" />
          <Button variant="outline" className="w-full">Sign In</Button>
        </div>
        <p className="text-center text-xs text-[#786E5F]">
          <Link href="/" className="hover:text-[#F0EBDC]">← Back to home</Link>
        </p>
      </CardContent>
    </Card>
  )
}
