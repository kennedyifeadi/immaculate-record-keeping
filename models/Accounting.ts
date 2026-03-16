import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAccountingItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  revenue: number;
  cost: number;
  profit: number;
}

export interface IAccounting extends Document {
  date: Date;
  day: number;
  month: number;
  year: number;
  products: IAccountingItem[];
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
}

const AccountingItemSchema = new Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  cost: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },
});

const AccountingSchema: Schema<IAccounting> = new Schema(
  {
    date: { type: Date, required: true },
    day: { type: Number, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    products: [AccountingItemSchema],
    totalRevenue: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    totalProfit: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound index to ensure uniqueness per day (or just date index if date includes time? Usually date is stripped to midnight for logs)
// We should probably strip time to midnight when storing, or just use day-month-year for uniqueness.
// In sale.ts: SaleSchema.index({ vendor: 1, date: 1 }, { unique: true });
// For Accounting, it's just one log per day for ALL products.
AccountingSchema.index({ date: 1 }, { unique: true });

export const Accounting: Model<IAccounting> =
  mongoose.models.Accounting || mongoose.model<IAccounting>('Accounting', AccountingSchema);
