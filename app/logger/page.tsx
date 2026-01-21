// app/logger/page.tsx
import { getVendors } from '@/actions/vendor-actions';
import { getMonthlySales } from '@/actions/sale-actions';
import { getDaysInMonth } from '@/lib/date-helpers';
import SalesGrid from '@/components/SalesGrid';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function LoggerPage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string };
}) {
  const today = new Date();
  const currentMonth = searchParams.month ? parseInt(searchParams.month) : today.getMonth();
  const currentYear = searchParams.year ? parseInt(searchParams.year) : today.getFullYear();
  
  const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' });

  const [vendors, salesMap] = await Promise.all([
    getVendors(),
    getMonthlySales(currentYear, currentMonth),
  ]);

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);

  return (
    // FIX 1: Use h-[calc(100vh-theme(spacing.16))] to fill screen minus padding
    <div className="flex flex-col h-[calc(100vh-6rem)] space-y-4">
      
      {/* HEADER: Prevents this from scrolling */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Daily Logger</h1>
          <p className="text-slate-500">
            Recording sales for <span className="font-bold text-blue-600">{monthName}</span>
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

      {/* TABLE CONTAINER: Restrict overflow here */}
      <div className="flex-1 border border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden relative">
        {/* Absolute positioning ensures the scroll area fills the parent perfectly */}
        <div className="absolute inset-0 overflow-auto">
          <SalesGrid 
            vendors={vendors} 
            daysInMonth={daysInMonth} 
            salesMap={salesMap} 
            month={currentMonth}
            year={currentYear}
          />
        </div>
      </div>
    </div>
  );
}