import "server-only";
import mongoose from "mongoose";

// Reuse one connection across hot reloads in development and across requests
// on the same server in production.
const cached = globalThis._mongoose ?? (globalThis._mongoose = { conn: null, promise: null });

export async function connectDB() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Add your MongoDB connection string to .env.local");
  }

  cached.promise ??= mongoose.connect(uri, {
    bufferCommands: false,
    // Indexes are created while developing; checking them on every production
    // start only adds slow extra trips to the database.
    autoIndex: process.env.NODE_ENV !== "production",
    serverSelectionTimeoutMS: 10000,
  });
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
  return cached.conn;
}
