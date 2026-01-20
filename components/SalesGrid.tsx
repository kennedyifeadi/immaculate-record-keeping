'use client'

import { useState, useTransition } from 'react';
import { logSale } from '@/actions/sale-actions';
import { formatDateForHeader, isDateBeforeJoin } from '@/lib/date-helpers';
import { useRouter } from 'next/navigation';

interface Props {
  vendors: any[];
  daysInMonth: Date[];
  salesMap: Record<string, number>; // Format: "vendorId-day": amount
  month: number;
  year: number;
}

export default function SalesGrid({ vendors, daysInMonth, salesMap, month, year }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Helper to calculate total for a specific vendor row
  const getVendorTotal = (vendorId: string) => {
    let total = 0;
    daysInMonth.forEach(day => {
      const dayNum = day.getDate();
      const key = `${vendorId}-${dayNum}`;
      total += (salesMap[key] || 0);
    });
    return total;
  };

  // The function that saves data when she leaves a cell
  const handleSave = async (vendorId: string, date: Date, val: string) => {
    const amount = parseFloat(val);
    if (isNaN(amount)) return; // Don't save if empty or text

    // Optimistic UI: We could update state locally, but for now we trust the server revalidate
    // We wrap this in startTransition so Next.js knows it's a background update
    startTransition(async () => {
      await logSale(vendorId, date.toISOString(), amount);
      // Optional: router.refresh() if you want to see updated totals immediately
      router.refresh(); 
    });
  };

  return (
    <table className="w-full text-sm text-left border-collapse">
      {/* 1. THE HEADER ROW (Dates) */}
      <thead className="bg-gray-100 text-gray-700 font-bold sticky top-0 z-10 shadow-sm">
        <tr>
          <th className="p-3 border sticky left-0 bg-gray-100 min-w-[150px] z-20">Vendor Name</th>
          {daysInMonth.map((day) => (
            <th key={day.toISOString()} className="p-2 border min-w-[80px] text-center whitespace-nowrap">
              {formatDateForHeader(day)}
            </th>
          ))}
          <th className="p-3 border bg-blue-50 min-w-[100px] text-center">Total</th>
        </tr>
      </thead>

      {/* 2. THE BODY (Vendors) */}
      <tbody>
        {vendors.map((vendor) => (
          <tr key={vendor._id} className="hover:bg-gray-50 group">
            
            {/* Vendor Name Column (Sticky Left) */}
            <td className="p-3 border font-medium bg-white group-hover:bg-gray-50 sticky left-0 z-10">
              {vendor.name}
            </td>

            {/* Day Columns */}
            {daysInMonth.map((day) => {
              const dayNum = day.getDate();
              const key = `${vendor._id}-${dayNum}`;
              const val = salesMap[key] || ''; // Get value or empty string

              // THE LOGIC: Check if this day is before they joined
              const isLocked = isDateBeforeJoin(day, vendor.joinedDate);

              if (isLocked) {
                // RENDER BLACK BOX
                return <td key={day.toISOString()} className="border bg-gray-800 cursor-not-allowed"></td>;
              }

              // RENDER INPUT BOX
              return (
                <td key={day.toISOString()} className="border p-0 relative">
                  <input
                    type="number"
                    defaultValue={val} // Use defaultValue for performance (uncontrolled input)
                    onBlur={(e) => handleSave(vendor._id, day, e.target.value)}
                    className="w-full h-full p-2 text-center outline-none focus:bg-blue-50 focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="-"
                  />
                </td>
              );
            })}

            {/* Total Column */}
            <td className="p-3 border font-bold text-center bg-blue-50">
              ₦{getVendorTotal(vendor._id).toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}