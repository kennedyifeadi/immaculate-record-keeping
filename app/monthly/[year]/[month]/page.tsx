
import { getVendors } from '@/actions/vendor-actions';
import { getMonthlySales } from '@/actions/sale-actions';
import { getDaysInMonth } from '@/lib/date-helpers';
import SalesGrid from '@/components/SalesGrid';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function MonthlyDetailPage({
    params,
}: {
    params: Promise<{ year: string; month: string }>;
}) {
    const { year, month } = await params;
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    if (isNaN(yearNum) || isNaN(monthNum)) {
        notFound();
    }

    const monthName = new Date(yearNum, monthNum).toLocaleString('default', { month: 'long', year: 'numeric' });

    // Fetch data
    const [vendors, salesMap] = await Promise.all([
        getVendors(),
        getMonthlySales(yearNum, monthNum),
    ]);

    const daysInMonth = getDaysInMonth(monthNum, yearNum);

    // Calculate Rankings for consistency (even in history)
    // Aggregate totals per vendor
    const vendorTotals: Record<string, number> = {};
    vendors.forEach((vendor: any) => {
        vendorTotals[vendor._id] = 0;
    });

    Object.entries(salesMap).forEach(([key, amount]) => {
        // key is "vendorId-day"
        const vendorId = key.split('-')[0];
        if (vendorTotals[vendorId] !== undefined) {
            vendorTotals[vendorId] += amount;
        }
    });

    // Sort vendors by total (descending)
    const sortedVendors = [...vendors].sort((a, b) => {
        const totalA = vendorTotals[a._id] || 0;
        const totalB = vendorTotals[b._id] || 0;
        return totalB - totalA;
    });

    // Assign ranks
    const rankings: Record<string, number> = {};
    let currentRank = 1;
    sortedVendors.forEach((vendor, index) => {
        if (index > 0) {
            const prevVendor = sortedVendors[index - 1];
            const prevTotal = vendorTotals[prevVendor._id] || 0;
            const currentTotal = vendorTotals[vendor._id] || 0;
            if (currentTotal < prevTotal) {
                currentRank = index + 1;
            }
        }
        rankings[vendor._id] = index + 1;
    });

    return (
        // Layout Fix: Using calc to fill screen minus padding
        <div className="flex flex-col h-[calc(100vh-6rem)] space-y-4">

            {/* HEADER */}
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link href="/monthly" className="text-slate-400 hover:text-blue-600 transition-colors">
                            <ArrowLeft size={18} />
                        </Link>
                        <h1 className="text-2xl font-bold text-slate-800">Monthly History</h1>
                    </div>
                    <p className="text-slate-500 ml-7">
                        Viewing records for <span className="font-bold text-blue-600">{monthName}</span>
                    </p>
                </div>
            </div>

            {/* TABLE CONTAINER */}
            <div className="flex-1 border border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden relative">
                <div className="absolute inset-0 overflow-auto">
                    <SalesGrid
                        vendors={sortedVendors}
                        daysInMonth={daysInMonth}
                        salesMap={salesMap}
                        month={monthNum}
                        year={yearNum}
                        rankings={rankings}
                    />
                </div>
            </div>
        </div>
    );
}
