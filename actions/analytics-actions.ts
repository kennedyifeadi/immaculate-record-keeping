'use server'

import dbConnect from '@/lib/db';
import { Sale } from '@/models/sale';
import { Vendor } from '@/models/vendor';

export async function getAnalyticsData() {
  await dbConnect();
  const currentYear = new Date().getFullYear();

  // 1. AGGREGATE MONTHLY REVENUE
  const monthlyAgg = await Sale.aggregate([
    { $match: { year: currentYear } },
    { $group: { _id: "$month", total: { $sum: "$amount" } } },
    { $sort: { _id: 1 } }
  ]);

  const monthlyTrends = Array.from({ length: 12 }, (_, i) => {
    const found = monthlyAgg.find(m => m._id === i);
    return {
      name: new Date(0, i).toLocaleString('default', { month: 'short' }),
      total: found ? found.total : 0
    };
  });

  // 2. AGGREGATE VENDOR RANKINGS
  const vendorAgg = await Sale.aggregate([
    { $match: { year: currentYear } },
    { $group: { _id: "$vendor", total: { $sum: "$amount" } } },
    { $sort: { total: -1 } },
    { $lookup: { 
        from: "vendors", 
        localField: "_id", 
        foreignField: "_id", 
        as: "vendorInfo" 
    }},
    { $unwind: "$vendorInfo" },
    
    // --- FIX IS HERE ---
    // We added "_id: 0" to exclude the MongoDB ObjectId object
    { $project: { name: "$vendorInfo.name", total: 1, _id: 0 } } 
  ]);

  // 3. CALCULATE KPIs
  const totalRevenue = monthlyAgg.reduce((acc, curr) => acc + curr.total, 0);
  const activeVendorsCount = await Vendor.countDocuments({ isActive: true });
  
  const bestMonth = monthlyTrends.reduce((max, curr) => curr.total > max.total ? curr : max, { name: '-', total: 0 });

  return {
    monthlyTrends,
    vendorRankings: vendorAgg, // Now this is a plain list of { name, total }
    kpis: {
      totalRevenue,
      vendorCount: activeVendorsCount,
      bestMonthName: bestMonth.name,
      year: currentYear
    }
  };
}