import "server-only";
import { revalidatePath } from "next/cache";
import { UserError } from "./errors";

// Runs a server action body and turns the result into a message for the form.
// Any change can affect totals on every page, so the whole app is revalidated.
export async function runAction(fn) {
  try {
    const message = await fn();
    revalidatePath("/", "layout");
    return { ok: true, message: message ?? "Saved." };
  } catch (error) {
    if (error instanceof UserError) return { ok: false, message: error.message };
    throw error;
  }
}
