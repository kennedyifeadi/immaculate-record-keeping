import dbConnect from '@/lib/db';
import { Vendor } from '@/models/vendor';
import { revalidatePath } from 'next/cache';

// 1. Fetch all active vendors
export async function getVendors() {
  await dbConnect();
  try {
    const vendors = await Vendor.find({ isActive: true })
      .sort({ name: 1 })
      .lean();

    // We must convert ObjectIds and Dates to strings for Next.js
    return vendors.map((v) => ({
      ...v,
      _id: v._id.toString(),
      joinedAt: v.joinedAt.toISOString(),
    //   createdAt: v.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Failed to fetch vendors:', error);
    return [];
  }
}

// 2. Create a new vendor
export async function createVendor(name: string, joinedAtStr: string) {
  await dbConnect();

  try {
    await Vendor.create({
      name,
      joinedAt: new Date(joinedAtStr),
      isActive: true,
    });

    // Refresh the dashboard so the new vendor appears immediately
    revalidatePath('/'); 
    return { success: true };
  } catch (error) {
    console.error('Failed to create vendor:', error);
    return { success: false, error: 'Failed to create vendor' };
  }
}