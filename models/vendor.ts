import mongoose, {Schema, Document, Model} from "mongoose"

export interface IVendor extends Document {
    name: string;
    joinedAt: Date;
    isActive: boolean;
}

const VendorSchema: Schema<IVendor> = new Schema({
    name: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Vendor: Model<IVendor> = mongoose.models.Vendor || mongoose.model<IVendor>("Vendor", VendorSchema);