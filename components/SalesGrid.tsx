'use client'

import { useTransition } from 'react';
import { logSale } from '@/actions/sale-actions';
import { formatDateForHeader, isDateBeforeJoin } from '@/lib/date-helpers';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';

interface Props {
  vendors: any[];
  daysInMonth: Date[];
  salesMap: Record<string, number>;
  month: number;
  year: number;
}

export default function SalesGrid({ vendors, daysInMonth, salesMap, month, year }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const getVendorTotal = (vendorId: string) => {
    let total = 0;
    daysInMonth.forEach(day => {
      const dayNum = day.getDate();
      const key = `${vendorId}-${dayNum}`;
      total += (salesMap[key] || 0);
    });
    return total;
  };

  const handleSave = async (vendorId: string, date: Date, val: string) => {
    const amount = parseFloat(val);
    if (isNaN(amount) && val !== '') return; 

    startTransition(async () => {
      await logSale(vendorId, date.toISOString(), isNaN(amount) ? 0 : amount);
      await router.refresh();
    });
  };

  return (
    <table className="min-w-max w-full text-sm text-left border-collapse">
      {/* 1. HEADER ROW */}
      <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs tracking-wider sticky top-0 z-30 shadow-sm">
        <tr>
          {/* STICKY VENDOR HEADER (Top Left Corner) */}
          {/* z-index must be higher than everything else (40 or 50) */}
          <th className="p-3 border-b border-r border-slate-200 sticky left-0 top-0 z-50 bg-slate-50 min-w-[200px] text-left shadow-[4px_0_5px_-2px_rgba(0,0,0,0.05)]">
            Vendor Name
          </th>
          
          {/* Date Headers */}
          {daysInMonth.map((day) => (
            <th key={day.toISOString()} className="p-2 border-b border-r border-slate-200 min-w-[80px] text-center whitespace-nowrap bg-slate-50">
              {formatDateForHeader(day)}
            </th>
          ))}
          
          {/* Total Header */}
          <th className="p-3 border-b border-slate-200 bg-blue-50/50 text-blue-700 min-w-[100px] text-center border-l sticky right-0 z-30">
            Total
          </th>
        </tr>
      </thead>

      {/* 2. BODY */}
      <tbody className="divide-y divide-slate-100">
        {vendors.map((vendor) => (
          <tr key={vendor._id} className="group hover:bg-slate-50/50 transition-colors">
            
            {/* STICKY VENDOR NAME (Left Column) */}
            {/* Must have bg-white to hide scrolling content behind it */}
            <td className="p-3 border-r border-slate-200 font-medium text-slate-700 sticky left-0 z-20 bg-white group-hover:bg-slate-50 shadow-[4px_0_5px_-2px_rgba(0,0,0,0.05)]">
              {vendor.name}
            </td>

            {/* Day Columns */}
            {daysInMonth.map((day) => {
              const dayNum = day.getDate();
              const key = `${vendor._id}-${dayNum}`;
              const val = salesMap[key] || '';
              const isLocked = isDateBeforeJoin(day, vendor.joinedDate);

              if (isLocked) {
                return (
                  <td 
                    key={day.toISOString()} 
                    className="border-r border-slate-200 bg-slate-800 cursor-not-allowed min-w-[80px]"
                    title="Vendor had not joined yet"
                  />
                );
              }

              return (
                <td key={day.toISOString()} className="border-r border-slate-200 p-0 relative h-10 min-w-[80px]">
                  <input
                    type="number"
                    defaultValue={val}
                    onBlur={(e) => handleSave(vendor._id, day, e.target.value)}
                    className={clsx(
                      "w-full h-full text-center outline-none transition-all bg-transparent",
                      "text-slate-700 placeholder:text-slate-300",
                      "focus:bg-blue-50 focus:ring-2 focus:ring-inset focus:ring-blue-500/50"
                    )}
                    placeholder="-"
                  />
                </td>
              );
            })}

            {/* Total Column */}
            <td className="p-3 border-l border-slate-200 font-bold text-center text-slate-700 bg-blue-50/30 min-w-[100px]">
              ₦{getVendorTotal(vendor._id).toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}