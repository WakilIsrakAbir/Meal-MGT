import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { UserError } from "./errors";
import { isValidDate } from "./dates";

export const dateField = z.string().refine(isValidDate, { error: "Pick a valid date" });
export const idField = (message) => z.string().refine(isValidObjectId, { error: message });
export const mealCount = z.coerce.number().int().min(0).max(10);

// Parse data with a zod schema; show the first problem to the user.
export function parse(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) throw new UserError(result.error.issues[0].message);
  return result.data;
}
