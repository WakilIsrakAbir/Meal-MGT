"use client";

import { useEffect } from "react";
import { Toaster as SonnerToaster, toast } from "sonner";

export default function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      duration={4000}
      toastOptions={{ style: { fontFamily: "var(--font-geist-sans), Arial, sans-serif" } }}
    />
  );
}

// Shows a toast once when a page opens, e.g. "/login?notice=requested".
export function ToastOnLoad({ id, type = "info", message }) {
  useEffect(() => {
    if (!message) return;
    const show = { success: toast.success, error: toast.error, warning: toast.warning }[type] ?? toast.info;
    show(message, { id }); // the id stops the same toast from showing twice
  }, [id, type, message]);
  return null;
}
