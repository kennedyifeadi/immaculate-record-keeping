import { getAllVendorsAdmin } from '@/actions/vendor-actions';
import VendorTable from '@/components/vendors/VendorTable';
import Link from 'next/link';
import { Plus, Users } from 'lucide-react';

export default async function VendorsPage() {
  const vendors = await getAllVendorsAdmin();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-blue-600" />
            Vendor Management
          </h1>
          <p className="text-slate-500">View, search, and manage your vendor directory.</p>
        </div>
        <Link 
          href="/vendors/add" 
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
        >
          <Plus size={18} />
          Add New Vendor
        </Link>
      </div>

      {/* Table Component */}
      <VendorTable vendors={vendors} />
      
    </div>
  );
}