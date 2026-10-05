import mongoose, { Schema } from "mongoose";

// status: "pending" (asked to join), "approved" (can use the app), "rejected".
const memberSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "member"], default: "member" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    active: { type: Boolean, default: true },
    defaultMeals: {
      lunch: { type: Number, default: 1, min: 0, max: 10 },
      dinner: { type: Number, default: 1, min: 0, max: 10 },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Member || mongoose.model("Member", memberSchema);
