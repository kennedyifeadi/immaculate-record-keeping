export const dynamic = 'force-dynamic';
import { getAnalyticsData } from '@/actions/analytics-actions';
import { RevenueTrendChart, VendorRankingChart } from '@/components/analytics/Charts';
import { TrendingUp, Wallet, Users } from 'lucide-react';

export default async function AnalyticsPage() {
  const { monthlyTrends, vendorRankings, kpis } = await getAnalyticsData();

  return (
    <div className="space-y-8">
      
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Business Analytics</h1>
        <p className="text-slate-500">Performance report for Year {kpis.year}</p>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Revenue */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Total Revenue (YTD)</p>
            <h3 className="text-2xl font-bold text-slate-800">
              ₦{kpis.totalRevenue.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Card 2: Best Month */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Best Performing Month</p>
            <h3 className="text-2xl font-bold text-slate-800">
              {kpis.bestMonthName}
            </h3>
          </div>
        </div>

        {/* Card 3: Active Vendors */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Active Vendors</p>
            <h3 className="text-2xl font-bold text-slate-800">
              {kpis.vendorCount}
            </h3>
          </div>
        </div>
      </div>

      {/* 3. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Revenue Trend */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[400px]">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800">Revenue Growth</h3>
            <p className="text-sm text-slate-400">Monthly sales performance</p>
          </div>
          <div className="h-[300px]">
            <RevenueTrendChart data={monthlyTrends} />
          </div>
        </div>

        {/* Vendor Ranking */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[400px]">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800">Top Vendors</h3>
            <p className="text-sm text-slate-400">Leaderboard by total sales volume</p>
          </div>
          <div className="h-[300px]">
             <VendorRankingChart data={vendorRankings} />
          </div>
        </div>

      </div>

      {/* 4. Detailed List (Optional but helpful) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">Vendor Performance Breakdown</h3>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-semibold">
            <tr>
              <th className="px-6 py-4">Rank</th>
              <th className="px-6 py-4">Vendor Name</th>
              <th className="px-6 py-4 text-right">Total Sales</th>
              <th className="px-6 py-4 text-right">Contribution</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vendorRankings.map((vendor: any, index: number) => (
              <tr key={index} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 text-slate-500">#{index + 1}</td>
                <td className="px-6 py-4 font-medium text-slate-800">{vendor.name}</td>
                <td className="px-6 py-4 text-right font-medium">₦{vendor.total.toLocaleString()}</td>
                <td className="px-6 py-4 text-right text-slate-500">
                  {((vendor.total / kpis.totalRevenue) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}