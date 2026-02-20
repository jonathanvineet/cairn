'use client'

import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useWallet } from '@/hooks/useWallet'
import { Wallet, Shield, ExternalLink } from 'lucide-react'

export default function WalletPage() {
  const { isConnected, accountId, network, balance, connectWallet, disconnectWallet } = useWallet()

  return (
    <div className="space-y-6">
      <PageHeader title="Wallet & HCS" description="Manage your Hedera wallet connection and HCS topic status" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Wallet className="w-4 h-4 text-green-500" />
              HashPack / WalletConnect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isConnected ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#786E5F]">Account ID</span>
                  <code className="text-sm font-mono text-green-400">{accountId}</code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#786E5F]">Network</span>
                  <Badge variant="teal">{network}</Badge>
                </div>
                {balance !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#786E5F]">Balance</span>
                    <span className="text-sm text-[#F0EBDC]">{balance} ℏ</span>
                  </div>
                )}
                <Button variant="outline" onClick={disconnectWallet} className="w-full">
                  Disconnect Wallet
                </Button>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-[#786E5F]">
                  Connect your HashPack wallet to sign and submit HCS messages for inspection evidence anchoring.
                </p>
                <Button onClick={connectWallet} className="w-full">
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-teal-500" />
              HCS Topic Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#786E5F]">Inspection Topic</span>
              <span className="font-mono text-xs text-[#B4AA96]">
                {process.env.NEXT_PUBLIC_HCS_INSPECTION_TOPIC_ID || 'Not configured'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#786E5F]">Alert Topic</span>
              <span className="font-mono text-xs text-[#B4AA96]">
                {process.env.NEXT_PUBLIC_HCS_ALERT_TOPIC_ID || 'Not configured'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#786E5F]">Mirror Node</span>
              <a href="https://testnet.mirrornode.hedera.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-teal-400 text-xs hover:underline">
                Testnet <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
