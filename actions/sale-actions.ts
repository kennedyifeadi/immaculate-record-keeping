'use server'

import dbConnect from '@/lib/db';
import { Sale } from '@/models/sale';
import { revalidatePath } from 'next/cache';

// 1. Log or Update a Sale (Strictly One Per Day)
export async function logSale(
  vendorId: string,
  dateStr: string,
  amount: number
) {
  await dbConnect();
  const dateObj = new Date(dateStr);

  // Extract strict date components
  const day = dateObj.getDate();
  const month = dateObj.getMonth();
  const year = dateObj.getFullYear();

  try {
    // FIX: Find by Day/Month/Year instead of exact Date timestamp.
    // This ensures we update the existing entry for "Jan 1st" instead of creating a new one
    // just because the time is slightly different.
    await Sale.findOneAndUpdate(
      {
        vendor: vendorId,
        day: day,
        month: month,
        year: year
      },
      {
        amount: amount,
        date: dateObj, // We still save the full date for reference
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    // Revalidate pages that depend on sales data so UI shows fresh totals
    try {
      revalidatePath('/');
      revalidatePath('/analytics');
      revalidatePath('/logger');
      revalidatePath('/vendors');
      revalidatePath('/monthly', 'layout'); // Update all monthly pages
    } catch (e) {
      // revalidatePath can throw during tests or non-Next environments; ignore silently
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to log sale:', error);
    return { success: false };
  }
}

// 2. Fetch Sales (Keep existing getMonthlySales logic)
export async function getMonthlySales(year: number, month: number) {
  await dbConnect();

  try {
    const sales = await Sale.find({ year, month }).lean();
    const salesMap: Record<string, number> = {};

    sales.forEach((sale) => {
      const key = `${sale.vendor.toString()}-${sale.day}`;
      salesMap[key] = sale.amount;
    });

    return salesMap;
  } catch (error) {
    return {};
  }
}

// 3. Get all months that have data
export async function getAvailableMonths() {
  await dbConnect();
  try {
    // Aggregation to find distinct year/month combinations
    // Returns [{ _id: { year: 2024, month: 0 } }, ... ]
    const result = await Sale.aggregate([
      {
        $group: {
          _id: { year: "$year", month: "$month" }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } } // Sort newest first
    ]);

    return result.map((item: any) => ({
      year: item._id.year,
      month: item._id.month
    }));
  } catch (error) {
    console.error("Failed to fetch available months:", error);
    return [];
  }
}