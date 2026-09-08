"use client";

import { useEffect } from "react";
import { useErrorStore } from "@/store/useErrorStore";
import ToastAlert from "@/components/alertdialog";

const TOAST_MS = 5000;

function friendlyMessage(error) {
  if (/timeout of \d+ms exceeded/i.test(error)) {
    return "Our backend is starting up. Please wait a few seconds and try again.";
  }
  if (/network error/i.test(error)) {
    return "Can't reach the server. Check your connection and try again.";
  }
  return error;
}

export default function GlobalErrorListener() {
  const error = useErrorStore((s) => s.error);
  const errorId = useErrorStore((s) => s.errorId);
  const clearError = useErrorStore((s) => s.clearError);

  useEffect(() => {
    if (!error) return;

    const t = setTimeout(() => clearError(), TOAST_MS + 500);
    return () => clearTimeout(t);
  }, [error, errorId, clearError]);

  if (!error) return null;

  return (
    <ToastAlert
      key={errorId}
      type="destructive"
      message="Something went wrong"
      description={friendlyMessage(error)}
      duration={TOAST_MS}
    />
  );
}
