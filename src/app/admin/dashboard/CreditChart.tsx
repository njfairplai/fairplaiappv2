'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { creditUsageByMonth } from '@/lib/mockData'

export default function CreditChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={creditUsageByMonth}>
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6E7180' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#6E7180' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: '#1E1E24', border: '1px solid rgba(74,74,255,0.3)', borderRadius: 8 }} labelStyle={{ color: '#9DA2B3', fontSize: 12 }} itemStyle={{ color: '#F5F6FC', fontSize: 13 }} />
        <Bar dataKey="credits" fill="#4A4AFF" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
