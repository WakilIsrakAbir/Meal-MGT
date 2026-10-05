import mongoose, { Schema } from "mongoose";

// "bazar" is shared by meal count; "shared" bills are split equally.
// paidFromFund=false means `member` paid from their own pocket and gets credit for it.
const expenseSchema = new Schema(
  {
    type: { type: String, enum: ["bazar", "shared"], required: true },
    date: { type: String, required: true },
    month: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    note: { type: String, default: "", trim: true },
    member: { type: Schema.Types.ObjectId, ref: "Member", default: null },
    paidFromFund: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "Member" },
  },
  { timestamps: true }
);

export default mongoose.models.Expense || mongoose.model("Expense", expenseSchema);
