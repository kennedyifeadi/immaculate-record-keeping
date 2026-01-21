'use server'

import dbConnect from '@/lib/db';
import { Sale } from '@/models/sale';
import { Vendor } from '@/models/vendor';

export async function getDashboardStats() {
  await dbConnect();
  
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // 1. Get Totals for this Month
  const sales = await Sale.find({ month: currentMonth, year: currentYear }).populate('vendor');
  
  const vendorTotals: Record<string, { name: string, total: number }> = {};
  
  sales.forEach(sale => {
    const vendor = sale.vendor as any;
    const vId = vendor._id.toString();
    if (!vendorTotals[vId]) {
      vendorTotals[vId] = { name: vendor.name, total: 0 };
    }
    vendorTotals[vId].total += sale.amount;
  });

  const sortedVendors = Object.values(vendorTotals).sort((a, b) => b.total - a.total);

  // 2. Get Yesterday's Sales Data for Chart
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0,0,0,0);
  
  const yesterdaySales = await Sale.find({ 
    date: yesterday 
  }).populate('vendor').lean();

  const chartData = yesterdaySales.map(s => ({
    name: (s.vendor as any).name,
    amount: s.amount
  }));

  return {
    topVendor: sortedVendors[0] || { name: 'N/A', total: 0 },
    bottomVendor: sortedVendors[sortedVendors.length - 1] || { name: 'N/A', total: 0 },
    chartData
  };
}