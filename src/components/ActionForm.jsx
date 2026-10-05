"use client";

import { startTransition, useRef } from "react";
import { Icon, buttonClass } from "./ui";
import { useToastAction } from "./useToastAction";

// A form that runs a server action and shows its result as a toast.
// The action receives (previousState, formData) and returns { ok, message }.
// The fields are cleared only after a successful save, so a mistake (like a
// wrong password) keeps everything the person typed.
export default function ActionForm({
  action,
  children,
  submitLabel = "Save",
  submitIcon,
  variant = "primary",
  confirmText,
  fullWidth = false,
  className = "space-y-5",
}) {
  const formRef = useRef(null);
  const [, formAction, pending] = useToastAction(action, { onSuccess: () => formRef.current?.reset() });

  return (
    <form
      ref={formRef}
      className={className}
      onSubmit={(event) => {
        event.preventDefault();
        if (confirmText && !window.confirm(confirmText)) return;
        const formData = new FormData(event.currentTarget);
        startTransition(() => formAction(formData));
      }}
    >
      {children}
      <div className={fullWidth ? "flex flex-col" : "flex flex-wrap items-center gap-3"}>
        <button type="submit" disabled={pending} className={`${buttonClass[variant]} ${fullWidth ? "w-full py-2.5" : ""}`}>
          {submitIcon && <Icon name={submitIcon} className="h-4 w-4" />}
          {pending ? "Please wait…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
