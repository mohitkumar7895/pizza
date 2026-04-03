import mongoose from "mongoose";

const fileUploadSchema = new mongoose.Schema(
  {
    filename: String,
    mimetype: String,
    data: Buffer,
    size: Number,
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const FileUpload =
  mongoose.models.FileUpload ||
  mongoose.model("FileUpload", fileUploadSchema);
