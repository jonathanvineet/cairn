'use client'

import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { incidentSchema, IncidentFormData } from '@/lib/validators/incident.schema'

export default function ReportIncidentPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
  })

  const onSubmit = async (data: IncidentFormData) => {
    console.log('Incident data:', data)
  }

  return (
    <div>
      <PageHeader title="Report Incident" description="File a new boundary incident report" />
      <Card className="max-w-2xl">
        <CardHeader><CardTitle>Incident Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm text-[#B4AA96]">Zone ID</label>
              <Input {...register('zoneId')} placeholder="Zone identifier" />
              {errors.zoneId && <p className="text-xs text-red-400">{errors.zoneId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-[#B4AA96]">Description</label>
              <Input {...register('description')} placeholder="Describe the incident in detail" />
              {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
            </div>
            <Button type="submit" className="w-full">Submit Report</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
