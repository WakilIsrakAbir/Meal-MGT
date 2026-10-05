import mongoose, { Schema } from "mongoose";

// One document per member per day. Guests are counted as extra meals for the host.
const mealEntrySchema = new Schema(
  {
    member: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    month: { type: String, required: true, index: true }, // "YYYY-MM"
    lunch: { type: Number, default: 0, min: 0, max: 10 },
    dinner: { type: Number, default: 0, min: 0, max: 10 },
    updatedBy: { type: Schema.Types.ObjectId, ref: "Member" },
  },
  { timestamps: true }
);

mealEntrySchema.index({ member: 1, date: 1 }, { unique: true });

export default mongoose.models.MealEntry || mongoose.model("MealEntry", mealEntrySchema);
