'use server'

import dbConnect from '@/lib/db';
import { Sale } from '@/models/sale';
import { Vendor } from '@/models/vendor'; // Import is required

export async function getDashboardStats() {
  await dbConnect();
  
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // FIX: Pass the actual Vendor model object into populate
  // instead of just the string 'vendor'.
  const sales = await Sale.find({ month: currentMonth, year: currentYear })
    .populate({ path: 'vendor', model: Vendor }); // <--- THE FIX
  
  const vendorTotals: Record<string, { name: string, total: number }> = {};
  
  sales.forEach(sale => {
    // Safety check: if a vendor was deleted, this might be null
    if (!sale.vendor) return; 

    // We cast to 'any' because populated fields are sometimes tricky in TS
    const vendorName = (sale.vendor as any).name;
    const vId = (sale.vendor as any)._id.toString();

    if (!vendorTotals[vId]) {
      vendorTotals[vId] = { name: vendorName, total: 0 };
    }
    vendorTotals[vId].total += sale.amount;
  });

  const sortedVendors = Object.values(vendorTotals).sort((a, b) => b.total - a.total);

  // 2. Get Yesterday's Sales Data for Chart
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0,0,0,0);
  
  // Apply the same fix here for yesterday's sales
  const yesterdaySales = await Sale.find({ 
    date: yesterday 
  })
  .populate({ path: 'vendor', model: Vendor }) // <--- THE FIX
  .lean();

  const chartData = yesterdaySales
    .map(s => {
      if (!s.vendor) return null;
      return {
        name: (s.vendor as any).name,
        amount: s.amount
      };
    })
    .filter((x): x is { name: string; amount: number } => x !== null);

  return {
    topVendor: sortedVendors[0] || { name: 'N/A', total: 0 },
    bottomVendor: sortedVendors[sortedVendors.length - 1] || { name: 'N/A', total: 0 },
    chartData
  };
}