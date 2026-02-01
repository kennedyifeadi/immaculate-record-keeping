import { getVendors } from '@/actions/vendor-actions';
import { getMonthlySales } from '@/actions/sale-actions';
import { getDaysInMonth } from '@/lib/date-helpers';
import SalesGrid from '@/components/SalesGrid';
import Link from 'next/link';
import { Plus } from 'lucide-react';
export const dynamic = 'force-dynamic';
export default async function LoggerPage() {
  // 1. STRICTLY CURRENT MONTH (No searchParams)
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const monthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Fetch data in parallel
  const [vendors, salesMap] = await Promise.all([
    getVendors(),
    getMonthlySales(currentYear, currentMonth),
  ]);

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);

  // 2. CALCULATE RANKINGS
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
    // Handle ties if needed, but simple rank 1, 2, 3... is fine for now.
    // Ideally check if total equals previous total.
    if (index > 0) {
      const prevVendor = sortedVendors[index - 1];
      const prevTotal = vendorTotals[prevVendor._id] || 0;
      const currentTotal = vendorTotals[vendor._id] || 0;
      if (currentTotal < prevTotal) {
        currentRank = index + 1;
      }
      // If equal, keep same rank (standard competition ranking 1224) or dense ranking (1223)
      // Let's stick to simple position-based rank for visual simplicity or standard competition.
      // Actually, let's just use index + 1 for unique ranks strictly based on sort?
      // User said "Ranking #1, #2". Usually implies order.
      // Let's do simple index + 1 for now.
    }
    rankings[vendor._id] = index + 1;
  });

  // OPTIONAL: Re-sort the vendors list passed to SalesGrid so #1 is at the top?
  // The prompt didn't strictly ask to reorder the rows, just "show a Ranking... next to each name".
  // However, usually a "Ranking" implies sorted view.
  // The current SalesGrid iterates `vendors`. If we pass `sortedVendors`, the rows will be sorted.
  // Let's pass `sortedVendors` instead of raw `vendors`.

  return (
    // Layout Fix: Using calc to fill screen minus padding (header + padding)
    <div className="flex flex-col h-[calc(100vh-6rem)] space-y-4">

      {/* HEADER: Fixed at the top, does not scroll */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Daily Logger</h1>
          <p className="text-slate-500">
            Recording (Current Cycle): <span className="font-bold text-blue-600">{monthName}</span>
          </p>
        </div>
        <Link
          href="/vendors/add"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
        >
          <Plus size={18} />
          Add Vendor
        </Link>
      </div>

      {/* TABLE CONTAINER: Restrict overflow to this box only */}
      <div className="flex-1 border border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden relative">
        {/* Absolute positioning forces the scroll area to fill the parent container */}
        <div className="absolute inset-0 overflow-auto">
          <SalesGrid
            vendors={sortedVendors}
            daysInMonth={daysInMonth}
            salesMap={salesMap}
            month={currentMonth}
            year={currentYear}
            rankings={rankings}
          />
        </div>
      </div>
    </div>
  );
}