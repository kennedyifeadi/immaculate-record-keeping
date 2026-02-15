'use client'

import { useState, useTransition } from 'react';
import { toggleVendorStatus, updateVendor } from '@/actions/vendor-actions';
import { Search, UserX, UserCheck, Calendar, Pencil, X } from 'lucide-react';

export default function VendorTable({ vendors }: { vendors: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const [isPending, startTransition] = useTransition();
  const [editingVendor, setEditingVendor] = useState<any | null>(null);
  const [newName, setNewName] = useState('');

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

  const handleEditClick = (vendor: any) => {
    setEditingVendor(vendor);
    setNewName(vendor.name);
  };

  const handleUpdate = () => {
    if (!editingVendor || !newName.trim()) return;
    
    startTransition(async () => {
      const res = await updateVendor(editingVendor._id, { name: newName });
      if (res.success) {
        setEditingVendor(null);
      } else {
        alert("Failed to update vendor");
      }
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
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEditClick(vendor)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Vendor Name"
                      >
                        <Pencil size={18} />
                      </button>
                      
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
                    </div>
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

      {/* Edit Modal */}
      {editingVendor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Edit Vendor Name</h3>
              <button 
                onClick={() => setEditingVendor(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              placeholder="Enter vendor name"
              autoFocus
            />

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setEditingVendor(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdate}
                disabled={isPending || !newName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}