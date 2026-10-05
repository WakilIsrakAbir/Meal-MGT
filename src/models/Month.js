import mongoose, { Schema } from "mongoose";

const monthSchema = new Schema(
  {
    key: { type: String, required: true, unique: true }, // "YYYY-MM"
    status: { type: String, enum: ["open", "closed"], default: "open" },
    closedAt: { type: Date, default: null },
    snapshot: { type: Schema.Types.Mixed, default: null }, // frozen report when closed
  },
  { timestamps: true }
);

export default mongoose.models.Month || mongoose.model("Month", monthSchema);
