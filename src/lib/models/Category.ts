import mongoose, { Schema, type Model, type InferSchemaType } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    sortOrder: { type: Number, default: 0 },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

export type CategoryDoc = InferSchemaType<typeof categorySchema> & {
  _id: mongoose.Types.ObjectId;
};

const modelName = "Category";

export const Category: Model<CategoryDoc> =
  mongoose.models[modelName] ??
  mongoose.model<CategoryDoc>(modelName, categorySchema);
