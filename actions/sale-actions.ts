'use server'

import dbConnect from '@/lib/db';
import { Sale } from '@/models/sale';

// 1. Log or Update a Sale
export async function logSale(
  vendorId: string, 
  dateStr: string, 
  amount: number
) {
  await dbConnect();

  const date = new Date(dateStr);
  
  try {
    // This query finds a sale for THIS vendor on THIS specific date
    await Sale.findOneAndUpdate(
      { 
        vendor: vendorId, 
        date: date 
      },
      {
        amount: amount,
        day: date.getDate(),
        month: date.getMonth(), // 0 = Jan, 1 = Feb
        year: date.getFullYear(),
      },
      { 
        upsert: true, // Create if it doesn't exist
        new: true,    
        setDefaultsOnInsert: true 
      }
    );

    // We do NOT revalidatePath here. 
    // Why? Because refreshing the whole page every time she types one number 
    // would make the grid laggy. We trust the Client State for this.
    return { success: true };
  } catch (error) {
    console.error('Failed to log sale:', error);
    return { success: false };
  }
}

// 2. Fetch Sales for a Specific Month
export async function getMonthlySales(year: number, month: number) {
  await dbConnect();

  try {
    const sales = await Sale.find({ year, month }).lean();

    // We transform the array into a Dictionary (Map)
    // Key format: "vendorID-day" (e.g., "65f2a...-15")
    // This allows the Grid to find values instantly without searching arrays.
    const salesMap: Record<string, number> = {};

    sales.forEach((sale) => {
      const key = `${sale.vendor.toString()}-${sale.day}`;
      salesMap[key] = sale.amount;
    });

    return salesMap;
  } catch (error) {
    console.error('Failed to get monthly sales:', error);
    return {};
  }
}