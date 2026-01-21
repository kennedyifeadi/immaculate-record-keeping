// app/page.tsx
import { getDashboardStats } from '@/actions/dashboard-actions';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import DashboardChart from '@/components/analytics/DashboardChart'; // We will build this next

export default async function Dashboard() {
  const { topVendor, bottomVendor, chartData } = await getDashboardStats();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-8">
      
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of vendor performance and daily logs.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-full border shadow-sm">
          <Calendar size={16} />
          {today}
        </div>
      </div>

      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl shadow-blue-200">
        <h2 className="text-3xl font-bold mb-2">Welcome back, Franca! 👋</h2>
        <p className="text-blue-100 opacity-90 max-w-xl">
          It&apos;s really nice to have you here. You have a few pending logs from yesterday. 
          Check out the performance summary below.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Top Performer */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-semibold bg-green-50 text-green-600 px-2 py-1 rounded-full">Top Vendor</span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Highest Sales (Month)</h3>
          <p className="text-2xl font-bold text-slate-800 mt-1">{topVendor.name}</p>
          <p className="text-sm text-slate-400 mt-1">Total: ₦{topVendor.total.toLocaleString()}</p>
        </div>

        {/* Low Performer */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <TrendingDown size={24} />
            </div>
            <span className="text-xs font-semibold bg-red-50 text-red-600 px-2 py-1 rounded-full">Needs Attention</span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Lowest Sales (Month)</h3>
          <p className="text-2xl font-bold text-slate-800 mt-1">{bottomVendor.name}</p>
          <p className="text-sm text-slate-400 mt-1">Total: ₦{bottomVendor.total.toLocaleString()}</p>
        </div>

        {/* Quick Stat */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <DollarSign size={24} />
            </div>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Yesterday&apos;s Total Volume</h3>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            ₦{chartData.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
          </p>
          <p className="text-sm text-slate-400 mt-1">Across all vendors</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Yesterday&apos;s Sales Trends</h3>
        <div className="h-[300px] w-full">
           <DashboardChart data={chartData} />
        </div>
      </div>
    </div>
  );
}