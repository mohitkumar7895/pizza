import mongoose, { Schema, type Model, type InferSchemaType } from "mongoose";

const productVariantSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    isVeg: { type: Boolean, default: true },
    variants: { type: [productVariantSchema], default: [] },
  },
  { timestamps: true }
);

export type ProductDoc = InferSchemaType<typeof productSchema> & {
  _id: mongoose.Types.ObjectId;
};

const modelName = "Product";

export const Product: Model<ProductDoc> =
  mongoose.models[modelName] ??
  mongoose.model<ProductDoc>(modelName, productSchema);
