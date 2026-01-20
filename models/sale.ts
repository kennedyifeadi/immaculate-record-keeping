import mongoose, {Schema, Document, Model} from "mongoose";

export interface ISale extends Document {
  vendor: mongoose.Types.ObjectId;
  amount: number;
  date: Date;   
  day: number;  
  month: number;
  year: number;  
}

const SaleSchema: Schema<ISale> = new Schema(
  {
    vendor: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Vendor', 
      required: true 
    },
    amount: { 
      type: Number, 
      required: true, 
      default: 0 
    },
    date: { 
      type: Date, 
      required: true 
    },
    // We store these separately to make filtering faster later
    day: { type: Number, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
  },
  { timestamps: true }
);

// COMPOUND INDEX: 
// This rule says: "A combination of Vendor + Date must be unique."
SaleSchema.index({ vendor: 1, date: 1 }, { unique: true });

export const Sale: Model<ISale> = 
  mongoose.models.Sale || mongoose.model<ISale>('Sale', SaleSchema);