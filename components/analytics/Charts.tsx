'use client'

import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

const CURRENCY_FORMATTER = (value: number) => `₦${(value / 1000).toFixed(0)}k`;

export function RevenueTrendChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis 
          dataKey="name" 
          stroke="#64748b" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
        />
        <YAxis 
          stroke="#64748b" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false}
          tickFormatter={CURRENCY_FORMATTER} 
        />
        <Tooltip 
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          formatter={(value?: number) => [
            value === undefined ? '₦0' : `₦${value.toLocaleString()}`,
            'Revenue' as const
          ]}
        />
        <Line 
          type="monotone" 
          dataKey="total" 
          stroke="#2563eb" 
          strokeWidth={3} 
          dot={{ r: 4, fill: "#2563eb", strokeWidth: 2, stroke: "#fff" }} 
          activeDot={{ r: 6 }} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function VendorRankingChart({ data }: { data: any[] }) {
  // Top 5 only for the chart to keep it clean
  const topData = data.slice(0, 10);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={topData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
        <XAxis type="number" hide />
        <YAxis 
          dataKey="name" 
          type="category" 
          width={100}
          stroke="#475569" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
        />
        <Tooltip 
          cursor={{ fill: '#f8fafc' }}
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          formatter={(value?: number) => [
            value === undefined ? '₦0' : `₦${value.toLocaleString()}`,
            'Total Sales' as const
          ]}
        />
        <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={20}>
          {topData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={index < 3 ? '#2563eb' : '#94a3b8'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}