// app/page.tsx
import { getVendors } from '@/actions/vendor-actions';
import { getMonthlySales } from '@/actions/sale-actions';
import { getDaysInMonth, formatDateForHeader, isDateBeforeJoin } from '@/lib/date-helpers';
import SalesGrid from '@/components/SalesGrid'; // We will create this component next
import Link from 'next/link';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string };
}) {
  // 1. Determine Current Date View
  const today = new Date();
  const currentMonth = searchParams.month ? parseInt(searchParams.month) : today.getMonth();
  const currentYear = searchParams.year ? parseInt(searchParams.year) : today.getFullYear();

  // 2. Fetch Data in Parallel (Faster)
  const [vendors, salesMap] = await Promise.all([
    getVendors(),
    getMonthlySales(currentYear, currentMonth),
  ]);

  // 3. Generate the Days (Columns)
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Imaculate Sales Log</h1>
        <div className="space-x-4">
          <Link 
            href="/vendors/add" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add Vendor
          </Link>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Export Report
          </button>
        </div>
      </div>

      {/* 4. The Main Grid Container */}
      <div className="overflow-x-auto bg-white shadow rounded-lg border">
        <SalesGrid 
          vendors={vendors} 
          daysInMonth={daysInMonth} 
          salesMap={salesMap} 
          month={currentMonth}
          year={currentYear}
        />
      </div>
    </main>
  );
}