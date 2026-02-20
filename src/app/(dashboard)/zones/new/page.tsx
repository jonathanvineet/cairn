'use client'

import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { zoneSchema, ZoneFormData } from '@/lib/validators/zone.schema'

export default function NewZonePage() {
  const { register, handleSubmit, formState: { errors } } = useForm<ZoneFormData>({
    resolver: zodResolver(zoneSchema),
    defaultValues: { coordinates: [] },
  })

  const onSubmit = async (data: ZoneFormData) => {
    console.log('Zone data:', data)
  }

  return (
    <div>
      <PageHeader title="Create Boundary Zone" description="Define a new boundary zone for inspection monitoring" />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Zone Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm text-[#B4AA96]">Zone Name</label>
              <Input {...register('name')} placeholder="e.g. Bandipur North Perimeter" />
              {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm text-[#B4AA96]">Region</label>
                <Input {...register('region')} placeholder="e.g. Bandipur" />
                {errors.region && <p className="text-xs text-red-400">{errors.region.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-[#B4AA96]">State</label>
                <Input {...register('state')} placeholder="e.g. Karnataka" />
                {errors.state && <p className="text-xs text-red-400">{errors.state.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-[#B4AA96]">Total Length (km)</label>
              <Input {...register('totalLengthKm', { valueAsNumber: true })} type="number" step="0.1" placeholder="0.0" />
              {errors.totalLengthKm && <p className="text-xs text-red-400">{errors.totalLengthKm.message}</p>}
            </div>
            <Button type="submit" className="w-full">Create Zone</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
