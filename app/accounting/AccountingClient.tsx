'use client'

import { useState, useTransition, useEffect } from 'react';
import { getAccountingByDate, saveAccountingLog, getMonthlyAccounting } from '@/actions/accounting-actions';
import { Calendar, Save, Percent, Calculator, TrendingUp } from 'lucide-react';

export default function AccountingClient({ 
  initialDailyLog, 
  initialMonthlyLogs, 
  currentDateStr 
}: { 
  initialDailyLog: any, 
  initialMonthlyLogs: any[], 
  currentDateStr: string 
}) {
  const [date, setDate] = useState(currentDateStr);
  const [dailyLog, setDailyLog] = useState(initialDailyLog);
  const [monthlyLogs, setMonthlyLogs] = useState(initialMonthlyLogs);
  const [isPending, startTransition] = useTransition();

  // Fetch log when date changes
  useEffect(() => {
    startTransition(async () => {
      const log = await getAccountingByDate(date);
      setDailyLog(log);
      
      const [year, month] = date.split('-');
      const mLogs = await getMonthlyAccounting(parseInt(month) - 1, parseInt(year));
      setMonthlyLogs(mLogs);
    });
  }, [date]);

  const handleQuantityChange = (productId: string, quantity: number) => {
    setDailyLog((prev: any) => {
      if (!prev) return prev;
      
      const updatedProducts = prev.products.map((item: any) => {
        if (item.product._id === productId) {
          const costPrice = item.product.costPrice || 0;
          const sellingPrice = item.product.sellingPrice || 0;
          
          const revenue = quantity * sellingPrice;
          const cost = quantity * costPrice;
          const profit = revenue - cost;
          
          return { ...item, quantity, revenue, cost, profit };
        }
        return item;
      });

      // Recalculate totals
      const totalRevenue = updatedProducts.reduce((sum: number, item: any) => sum + item.revenue, 0);
      const totalCost = updatedProducts.reduce((sum: number, item: any) => sum + item.cost, 0);
      const totalProfit = totalRevenue - totalCost;

      return {
        ...prev,
        products: updatedProducts,
        totalRevenue,
        totalCost,
        totalProfit
      };
    });
  };

  const handleSave = () => {
    if (!dailyLog) return;
    
    startTransition(async () => {
      const entries = dailyLog.products.map((item: any) => ({
        productId: item.product._id,
        quantity: item.quantity
      }));
      
      const res = await saveAccountingLog(date, entries);
      if (res.success) {
        alert("Accounting logged successfully");
        // Update monthly logs too after save
        const [year, month] = date.split('-');
        const mLogs = await getMonthlyAccounting(parseInt(month) - 1, parseInt(year));
        setMonthlyLogs(mLogs);
      } else {
        alert("Failed to save accounting log");
      }
    });
  };

  // Calculate percentages and metrics
  const totalRevenue = dailyLog?.totalRevenue || 0;
  const totalProfit = dailyLog?.totalProfit || 0;

  // Monthly breakdown summary
  const totalMonthlyRevenue = monthlyLogs.reduce((sum, log) => sum + (log.totalRevenue || 0), 0);
  const totalMonthlyCost = monthlyLogs.reduce((sum, log) => sum + (log.totalCost || 0), 0);
  const totalMonthlyProfit = totalMonthlyRevenue - totalMonthlyCost;
  const averageMargin = totalMonthlyRevenue > 0 ? (totalMonthlyProfit / totalMonthlyRevenue) * 100 : 0;

  return (
    <div className="space-y-8">
      
      {/* Date Picker & Top Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <Calendar className="text-slate-400" size={24} />
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border-b-2 border-slate-200 focus:border-blue-500 outline-none px-2 py-1 text-lg font-semibold text-slate-700 bg-transparent transition-all"
          />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1 md:justify-end">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-400 font-semibold block">Total Sales</span>
            <span className="text-lg font-bold text-slate-800">₦{totalRevenue.toLocaleString()}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-400 font-semibold block">Total Profit</span>
            <span className="text-lg font-bold text-green-600">₦{totalProfit.toLocaleString()}</span>
          </div>
          <button 
            onClick={handleSave}
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg flex items-center justify-center gap-2 font-semibold shadow-sm transition-all disabled:opacity-50 h-full col-span-2 md:col-span-1"
          >
            <Save size={18} />
            {isPending ? 'Saving...' : 'Save Log'}
          </button>
        </div>
      </div>

      {/* Daily Input Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Calculator size={18} className="text-blue-500" />
            Product Sales Entry
          </h2>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Code</th>
              <th className="px-6 py-3">Quantity</th>
              <th className="px-6 py-3">Cost</th>
              <th className="px-6 py-3">Revenue</th>
              <th className="px-6 py-3">Profit</th>
              <th className="px-6 py-3 text-right">% of Sales</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dailyLog?.products.map((item: any) => {
              const salesPercentage = totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0;
              
              return (
                <tr key={item.product._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {item.product.name}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-mono">
                      {item.product.code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="number" 
                      min="0"
                      value={item.quantity || ''}
                      onChange={(e) => handleQuantityChange(item.product._id, parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-slate-200 rounded text-right focus:ring-2 focus:ring-blue-500/20"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    ₦{item.cost.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">
                    ₦{item.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={item.profit > 0 ? "text-green-600 font-semibold" : "text-slate-400"}>
                      ₦{item.profit.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                      <Percent size={12} />
                      {salesPercentage.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <hr className="border-slate-200" />

      {/* Monthly Summary Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp size={20} className="text-green-500" />
            Monthly Overview
          </h2>
          <span className="text-sm text-slate-500 font-medium">
            Stats for {new Date(date).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Aggregate Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
            <span className="text-xs text-slate-400 font-semibold block mb-1">Monthly Sales</span>
            <span className="text-xl font-bold text-slate-800">₦{totalMonthlyRevenue.toLocaleString()}</span>
          </div>
          <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
            <span className="text-xs text-slate-400 font-semibold block mb-1">Monthly Cost</span>
            <span className="text-xl font-bold text-slate-500">₦{totalMonthlyCost.toLocaleString()}</span>
          </div>
          <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
            <span className="text-xs text-slate-400 font-semibold block mb-1">Monthly Profit</span>
            <span className="text-xl font-bold text-green-600">₦{totalMonthlyProfit.toLocaleString()}</span>
          </div>
          <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
            <span className="text-xs text-slate-400 font-semibold block mb-1">Profit Margin</span>
            <span className="text-xl font-bold text-blue-600">
              {averageMargin.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Monthly Logs Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Day</th>
                <th className="px-6 py-3">Revenue</th>
                <th className="px-6 py-3">Cost</th>
                <th className="px-6 py-3">Profit</th>
                <th className="px-6 py-3 text-right">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-slate-400">
                    No logs found for this month
                  </td>
                </tr>
              ) : (
                monthlyLogs.map((log) => {
                  const margin = log.totalRevenue > 0 ? (log.totalProfit / log.totalRevenue) * 100 : 0;
                  return (
                    <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3 font-semibold text-slate-700">
                        {log.day}
                      </td>
                      <td className="px-6 py-3 text-slate-800">
                        ₦{log.totalRevenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-slate-500">
                        ₦{log.totalCost.toLocaleString()}
                      </td>
                      <td className="px-6 py-3">
                        <span className={log.totalProfit > 0 ? "text-green-600" : "text-slate-400"}>
                          ₦{log.totalProfit.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-semibold">
                          {margin.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
