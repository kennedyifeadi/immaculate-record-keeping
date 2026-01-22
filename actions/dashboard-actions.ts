'use server'

import dbConnect from '@/lib/db';
import { Sale } from '@/models/sale';
import { Vendor } from '@/models/vendor'; // Keep this import!

export async function getDashboardStats() {
  await dbConnect();
  
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // 1. ADVANCED AGGREGATION to handle Duplicates
  const vendorStats = await Sale.aggregate([
    // A. Filter for current month
    { $match: { month: currentMonth, year: currentYear } },

    // B. Deduplicate: Group by Vendor + Day first
    // This solves the "Two sales in one day" bug by taking the LAST recorded amount
    {
      $group: {
        _id: { vendor: "$vendor", day: "$day" },
        amount: { $last: "$amount" } // "Last Write Wins" logic
      }
    },

    // C. Sum: Now group by Vendor to get the true monthly total
    {
      $group: {
        _id: "$_id.vendor",
        total: { $sum: "$amount" }
      }
    },

    // D. Populate Vendor Details
    {
      $lookup: {
        from: "vendors",
        localField: "_id",
        foreignField: "_id",
        as: "vendorInfo"
      }
    },
    { $unwind: "$vendorInfo" }, // Flatten the array

    // E. Sort Highest to Lowest
    { $sort: { total: -1 } }
  ]);

  // 2. Map results to your structure
  // Since we sorted in the DB, the first item is Top, last is Bottom
  const topVendor = vendorStats[0] 
    ? { name: vendorStats[0].vendorInfo.name, total: vendorStats[0].total } 
    : { name: 'N/A', total: 0 };

  const bottomVendor = vendorStats.length > 0
    ? { 
        name: vendorStats[vendorStats.length - 1].vendorInfo.name, 
        total: vendorStats[vendorStats.length - 1].total 
      }
    : { name: 'N/A', total: 0 };

  // 3. Get Yesterday's Data (Keep existing logic or update to aggregate)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDay = yesterday.getDate();

  const yesterdaySales = await Sale.aggregate([
    { $match: { month: currentMonth, year: currentYear, day: yesterdayDay } },
    {
       $group: {
         _id: "$vendor",
         amount: { $last: "$amount" } // Deduplicate yesterday too
       }
    },
    {
      $lookup: {
        from: "vendors",
        localField: "_id",
        foreignField: "_id",
        as: "vendorInfo"
      }
    },
    { $unwind: "$vendorInfo" }
  ]);

  const chartData = yesterdaySales.map(s => ({
    name: s.vendorInfo.name,
    amount: s.amount
  }));

  return { topVendor, bottomVendor, chartData };
}