'use server'

import dbConnect from "@/lib/db";
import { Product } from "@/models/Product";
import { revalidatePath } from "next/cache";

export async function getProducts() {
  await dbConnect();
  try {
    const products = await Product.find({}).sort({ name: 1 }).lean();
    return JSON.parse(JSON.stringify(products)); 
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export async function updateProduct(id: string, data: { costPrice?: number; sellingPrice?: number, name?: string, code?: string }) {
  await dbConnect();
  try {
    await Product.findByIdAndUpdate(id, data);
    revalidatePath('/price-configuration');
    revalidatePath('/accounting');
    return { success: true };
  } catch (error) {
    console.error("Failed to update product:", error);
    return { success: false };
  }
}

export async function addProduct(data: { name: string; code: string; costPrice: number; sellingPrice: number }) {
  await dbConnect();
  try {
    await Product.create(data);
    revalidatePath('/price-configuration');
    revalidatePath('/accounting');
    return { success: true };
  } catch (error) {
    console.error("Failed to add product:", error);
    return { success: false };
  }
}

export async function seedProducts() {
  await dbConnect();
  try {
    const count = await Product.countDocuments();
    if (count > 0) return { success: true, message: "Already seeded" };

    const initialProducts = [
      { name: "Large Super", code: "LS", costPrice: 237.3, sellingPrice: 270 },
      { name: "Large Vanilla", code: "LV", costPrice: 237.3, sellingPrice: 270 },
      { name: "Large Choco", code: "LC", costPrice: 132.9, sellingPrice: 270 },
      { name: "Small Super", code: "SS", costPrice: 121, sellingPrice: 150 },
      { name: "Small Vanilla", code: "SV", costPrice: 121, sellingPrice: 150 },
      { name: "Small Choco", code: "SC", costPrice: 87.25, sellingPrice: 150 },
      { name: "Pets Fan Yogo", code: "PFY", costPrice: 550, sellingPrice: 590 },
      { name: "Pets Fan Dago", code: "PFD", costPrice: 333.3, sellingPrice: 400 },
      { name: "Emirato", code: "EM", costPrice: 49, sellingPrice: 55 },
      { name: "Fan Ice Vanilla", code: "FIV", costPrice: 251.60, sellingPrice: 300 },
      { name: "Fan Ice Strawberry", code: "FIS", costPrice: 386.67, sellingPrice: 400 },
    ];

    await Product.insertMany(initialProducts);
    revalidatePath('/price-configuration');
    return { success: true, message: "Seeded successfully" };
  } catch (error) {
    console.error("Failed to seed products:", error);
    return { success: false };
  }
}
