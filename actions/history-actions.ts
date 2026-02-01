'use server'

import dbConnect from '@/lib/db';
import { Sale } from '@/models/sale';

export interface MonthlyHistorySummary {
    year: number;
    month: number;
    monthName: string;
    totalSales: number;
}

export async function getPastMonths(): Promise<MonthlyHistorySummary[]> {
    await dbConnect();

    const today = new Date();
    const currentMonth = today.getMonth(); // 0-11
    const currentYear = today.getFullYear();

    try {
        const result = await Sale.aggregate([
            // 1. MATCH: Filter for dates BEFORE the start of the current month
            // logic: (year < currentYear) OR (year == currentYear AND month < currentMonth)
            {
                $match: {
                    $or: [
                        { year: { $lt: currentYear } },
                        {
                            year: currentYear,
                            month: { $lt: currentMonth }
                        }
                    ]
                }
            },
            // 2. GROUP: Group by Year and Month, Sum Amount
            {
                $group: {
                    _id: { year: "$year", month: "$month" },
                    totalSales: { $sum: "$amount" }
                }
            },
            // 3. SORT: Descending (Newest first)
            {
                $sort: { "_id.year": -1, "_id.month": -1 }
            }
        ]);

        // 4. TRANSFORM: Map to friendly response format with month names
        return result.map(item => {
            const year = item._id.year;
            const month = item._id.month;

            // Create a date object just to get the locale month name
            // using day 1 is safe 
            const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'long' });

            return {
                year,
                month,
                monthName, // e.g., "February"
                totalSales: item.totalSales
            };
        });

    } catch (error) {
        console.error("Failed to fetch past months:", error);
        return [];
    }
}
