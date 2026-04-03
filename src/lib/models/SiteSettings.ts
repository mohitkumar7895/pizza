import mongoose, { Schema, type Model, type InferSchemaType } from "mongoose";

const siteSettingsSchema = new Schema(
  {
    key: { type: String, default: "main", unique: true, immutable: true },
    heroImages: {
      type: [String],
      default: () => ["", "", ""],
    },
  },
  { timestamps: true }
);

export type SiteSettingsDoc = InferSchemaType<typeof siteSettingsSchema> & {
  _id: mongoose.Types.ObjectId;
};

const modelName = "SiteSettings";

export const SiteSettings: Model<SiteSettingsDoc> =
  mongoose.models[modelName] ??
  mongoose.model<SiteSettingsDoc>(modelName, siteSettingsSchema);
