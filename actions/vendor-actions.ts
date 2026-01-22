'use server'

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
    revalidatePath('/logger');
    revalidatePath('/analytics');
    revalidatePath('/vendors');
    return { success: true };
  } catch (error) {
    console.error('Failed to create vendor:', error);
    return { success: false, error: 'Failed to create vendor' };
  }
}

// 3. Toggle Vendor Status (Active/Inactive)
export async function toggleVendorStatus(vendorId: string, currentStatus: boolean) {
  await dbConnect();
  try {
    await Vendor.findByIdAndUpdate(vendorId, { isActive: !currentStatus });
    revalidatePath('/vendors');
    revalidatePath('/logger'); // Also update logger so they disappear/reappear
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update status' };
  }
}

// 4. Update Vendor Details
export async function updateVendor(vendorId: string, data: { name: string }) {
  await dbConnect();
  try {
    await Vendor.findByIdAndUpdate(vendorId, { name: data.name });
    revalidatePath('/vendors');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update vendor' };
  }
}

// 5. Fetch ALL vendors (Active & Inactive) for the admin list
export async function getAllVendorsAdmin() {
  await dbConnect();
  try {
    const vendors = await Vendor.find({}).sort({ createdAt: -1 }).lean();
    return vendors.map((v) => ({
      ...v,
      _id: v._id.toString(),
      joinedDate: v.joinedAt.toISOString(),
      //   createdAt: v.createdAt.toISOString(),
    }));
  } catch (error) {
    return [];
  }
}

