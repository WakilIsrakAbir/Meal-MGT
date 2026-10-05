// Creates the admin account, or updates it if it already exists.
// Reads ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD from .env.local.
//
//   npm run create-admin

import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const { MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!MONGODB_URI || !ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Set MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in .env.local first.");
  process.exit(1);
}

await mongoose.connect(MONGODB_URI);
const members = mongoose.connection.collection("members");
const email = ADMIN_EMAIL.trim().toLowerCase();
const now = new Date();

const result = await members.updateOne(
  { email },
  {
    $set: {
      name: ADMIN_NAME.trim(),
      email,
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
      role: "admin",
      status: "approved",
      active: true,
      updatedAt: now,
    },
    $setOnInsert: { phone: "", defaultMeals: { lunch: 1, dinner: 1 }, createdAt: now },
  },
  { upsert: true }
);

console.log(result.upsertedCount ? `Admin created: ${email}` : `Admin updated: ${email}`);
await mongoose.disconnect();
