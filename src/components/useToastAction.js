"use client";

import { useActionState } from "react";
import { toast } from "sonner";

// Runs a server action and shows its { ok, message } result as a toast.
// The toast is fired as soon as the server answers, so it still shows when the
// form disappears afterwards (for example after accepting a join request).
export function useToastAction(action, { onSuccess } = {}) {
  return useActionState(async (previousState, formData) => {
    const result = await action(previousState, formData);
    if (result?.message) {
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
    }
    if (result?.ok) onSuccess?.();
    return result;
  }, null);
}
