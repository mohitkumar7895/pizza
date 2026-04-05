import mongoose, { Schema, type Model, type InferSchemaType } from "mongoose";

const navbarSettingsSchema = new Schema(
  {
    key: { type: String, default: "main", unique: true, immutable: true },
    logoUrl: { type: String, default: "" },
    brand: { type: String, default: "" },
    tagline: { type: String, default: "" },
    /** Shown on the Call button (tel: link) */
    phone: { type: String, default: "" },
  },
  { timestamps: true }
);

export type NavbarSettingsDoc = InferSchemaType<typeof navbarSettingsSchema> & {
  _id: mongoose.Types.ObjectId;
};

const modelName = "NavbarSettings";

export const NavbarSettings: Model<NavbarSettingsDoc> =
  mongoose.models[modelName] ??
  mongoose.model<NavbarSettingsDoc>(modelName, navbarSettingsSchema);
