import "server-only";
import mongoose from "mongoose";

// Reuse one connection across hot reloads in development.
const cached = globalThis._mongoose ?? (globalThis._mongoose = { conn: null, promise: null });

export async function connectDB() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Add your MongoDB connection string to .env.local");
  }

  cached.promise ??= mongoose.connect(uri, { bufferCommands: false });
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
  return cached.conn;
}
