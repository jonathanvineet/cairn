import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="System configuration and management" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { title: 'General', desc: 'App configuration and preferences' },
          { title: 'Zones', desc: 'Manage boundary zone settings' },
          { title: 'Users & Roles', desc: 'User management and permissions' },
        ].map(({ title, desc }) => (
          <Card key={title} className="hover:border-green-700/40 transition-colors cursor-pointer">
            <CardContent className="p-5">
              <div className="font-semibold text-[#F0EBDC] mb-1">{title}</div>
              <div className="text-sm text-[#786E5F]">{desc}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
