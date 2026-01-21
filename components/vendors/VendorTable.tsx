'use client'

import { useState, useTransition } from 'react';
import { toggleVendorStatus } from '@/actions/vendor-actions';
import { Search, UserX, UserCheck, Edit2, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VendorTable({ vendors }: { vendors: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Filter vendors based on search
  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    if (!confirm(currentStatus 
      ? "Are you sure you want to deactivate this vendor? They will be hidden from the daily logger." 
      : "Reactivate this vendor?")) return;

    startTransition(async () => {
      await toggleVendorStatus(id, currentStatus);
    });
  };

  return (
    <div className="space-y-4">
      
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text"
          placeholder="Search vendors by name..."
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Vendor Name</th>
              <th className="px-6 py-4">Joined Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredVendors.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                  No vendors found matching &quot;{searchTerm}&quot;
                </td>
              </tr>
            ) : (
              filteredVendors.map((vendor) => (
                <tr key={vendor._id} className="hover:bg-slate-50/50 transition-colors">
                  
                  {/* Name */}
                  <td className="px-6 py-4 font-medium text-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                        {vendor.name.charAt(0)}
                      </div>
                      {vendor.name}
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      {new Date(vendor.joinedDate).toLocaleDateString()}
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      vendor.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {vendor.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleToggleStatus(vendor._id, vendor.isActive)}
                      disabled={isPending}
                      className={`p-2 rounded-lg transition-colors ${
                        vendor.isActive 
                          ? 'text-red-600 hover:bg-red-50' 
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={vendor.isActive ? "Deactivate Vendor" : "Activate Vendor"}
                    >
                      {vendor.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="text-xs text-slate-400 text-center pt-2">
        Showing {filteredVendors.length} of {vendors.length} vendors
      </div>
    </div>
  );
}