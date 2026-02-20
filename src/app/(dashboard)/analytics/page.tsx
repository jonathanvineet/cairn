'use client'
import { BREACH_TREND_DATA, PATROL_FREQUENCY_DATA, CONDITION_BREAKDOWN_DATA, DEMO_ZONES } from '@/lib/placeholder'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getRiskLabel, getRiskColour } from '@/lib/utils/format'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts'

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Risk trends, patrol frequency, and condition breakdown</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-4">
            <p className="text-amber-800 font-semibold">⚠ Zone Nilgiris-04 has highest anomaly rate this month</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-4">
            <p className="text-orange-800 font-semibold">📍 Checkpoint 7, Zone Nilgiris-04: flagged 4× in 2 weeks</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-4">
            <p className="text-red-800 font-semibold">📅 Monday patrols have highest missed rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Breach Trend — Last 12 Weeks</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={BREACH_TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="breaches" stroke="#b83c28" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Condition Breakdown</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={CONDITION_BREAKDOWN_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name} ${value}%`}
                  labelLine={false}
                >
                  {CONDITION_BREAKDOWN_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Patrol Frequency — Last 4 Weeks</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={PATROL_FREQUENCY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="zone" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="week1" fill="#358337" name="Week 1" />
                <Bar dataKey="week2" fill="#54a457" name="Week 2" />
                <Bar dataKey="week3" fill="#84c386" name="Week 3" />
                <Bar dataKey="week4" fill="#b5ddb7" name="Week 4" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Zone Risk Score Table</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500 text-xs">
                  <th className="pb-2 font-medium">Rank</th>
                  <th className="pb-2 font-medium">Zone</th>
                  <th className="pb-2 font-medium">State</th>
                  <th className="pb-2 font-medium">Risk Score</th>
                  <th className="pb-2 font-medium">Level</th>
                  <th className="pb-2 font-medium">Patrols/Week</th>
                </tr>
              </thead>
              <tbody>
                {[...DEMO_ZONES].sort((a, b) => b.riskScore - a.riskScore).map((zone, i) => (
                  <tr key={zone.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 text-gray-400">#{i + 1}</td>
                    <td className="py-2 font-medium text-gray-900">{zone.name}</td>
                    <td className="py-2 text-gray-500">{zone.state}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 bg-gray-100 rounded-full">
                          <div
                            className={`h-full rounded-full ${zone.riskScore >= 75 ? 'bg-red-500' : zone.riskScore >= 50 ? 'bg-orange-400' : zone.riskScore >= 25 ? 'bg-yellow-400' : 'bg-green-500'}`}
                            style={{ width: `${zone.riskScore}%` }}
                          />
                        </div>
                        <span>{zone.riskScore}</span>
                      </div>
                    </td>
                    <td className="py-2">
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${getRiskColour(zone.riskScore)}`}>
                        {getRiskLabel(zone.riskScore)}
                      </span>
                    </td>
                    <td className="py-2 text-gray-600">{zone.patrolsThisWeek}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
