'use server'

import dbConnect from "@/lib/db";
import { Accounting } from "@/models/Accounting";
import { Product } from "@/models/Product";
import { revalidatePath } from "next/cache";

export async function getAccountingByDate(dateStr: string) {
  await dbConnect();
  // robust parsing for 'YYYY-MM-DD'
  const parts = dateStr.split('-');
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1; // 0-indexed
  const day = parseInt(parts[2]);
  const dateObj = new Date(year, month, day); 

  try {
    let log = await Accounting.findOne({ day, month, year })
      .populate('products.product')
      .lean();

    if (!log) {
      const products = await Product.find({}).sort({ name: 1 }).lean();
      const initialProducts = products.map(p => ({
        product: p, // populate it manually for initialization
        quantity: 0,
        revenue: 0,
        cost: 0,
        profit: 0
      }));

      return {
        date: dateObj,
        day,
        month,
        year,
        products: initialProducts,
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0,
        isNew: true
      };
    }

    return JSON.parse(JSON.stringify(log));
  } catch (error) {
    console.error("Failed to fetch accounting log:", error);
    return null;
  }
}

export async function saveAccountingLog(dateStr: string, entries: { productId: string, quantity: number }[]) {
  await dbConnect();
  // robust parsing for 'YYYY-MM-DD'
  const parts = dateStr.split('-');
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1; // 0-indexed
  const day = parseInt(parts[2]);
  const dateObj = new Date(year, month, day); 

  try {
    const products = await Product.find({}).lean();
    const productPriceMap: Record<string, { cost: number, selling: number }> = {};
    products.forEach(p => {
      productPriceMap[p._id.toString()] = { cost: p.costPrice, selling: p.sellingPrice };
    });

    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;

    const calculatedProducts = entries.map(entry => {
      const price = productPriceMap[entry.productId];
      const costPrice = price ? price.cost : 0;
      const sellingPrice = price ? price.selling : 0;

      const revenue = entry.quantity * sellingPrice;
      const cost = entry.quantity * costPrice;
      const profit = revenue - cost;

      totalRevenue += revenue;
      totalCost += cost;
      totalProfit += profit;

      return {
        product: entry.productId,
        quantity: entry.quantity,
        revenue,
        cost,
        profit
      };
    });

    await Accounting.findOneAndUpdate(
      { day, month, year },
      {
        date: dateObj,
        day,
        month,
        year,
        products: calculatedProducts,
        totalRevenue,
        totalCost,
        totalProfit
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    revalidatePath('/accounting');
    revalidatePath(`/monthly/${year}/${month + 1}`); // Next.js monthly path structure may vary, usually 1-indexed in routes
    return { success: true };
  } catch (error) {
    console.error("Failed to save accounting log:", error);
    return { success: false };
  }
}

export async function getMonthlyAccounting(month: number, year: number) {
  await dbConnect();
  try {
    // month is 0-indexed in JS, but might be 1-indexed in routes
    const logs = await Accounting.find({ month, year })
      .populate('products.product')
      .sort({ day: 1 })
      .lean();

    return JSON.parse(JSON.stringify(logs));
  } catch (error) {
    console.error("Failed to fetch monthly accounting:", error);
    return [];
  }
}

export async function getAvailableAccountingMonths() {
  await dbConnect();
  try {
    const result = await Accounting.aggregate([
      {
        $group: {
          _id: { year: "$year", month: "$month" }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } }
    ]);

    return result.map((item: any) => ({
      year: item._id.year,
      month: item._id.month
    }));
  } catch (error) {
    console.error("Failed to fetch available accounting months:", error);
    return [];
  }
}
