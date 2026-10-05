import mongoose, { Schema } from "mongoose";

// deposit: money given to the admin. refund: money given back.
// carry_forward: last month's balance, created when a month is closed (can be negative).
const depositSchema = new Schema(
  {
    member: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    type: { type: String, enum: ["deposit", "refund", "carry_forward"], default: "deposit" },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    month: { type: String, required: true, index: true },
    note: { type: String, default: "", trim: true },
    sourceMonth: { type: String, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "Member" },
  },
  { timestamps: true }
);

export default mongoose.models.Deposit || mongoose.model("Deposit", depositSchema);
