"use client";

import { useEffect } from "react";
import { useErrorStore } from "@/store/useErrorStore";
import ToastAlert from "@/components/alertdialog.js";

export default function GlobalErrorListener() {
  const { error, clearError } = useErrorStore();

  useEffect(() => {
    if (!error) return;

    const t = setTimeout(() => clearError(), 3000);
    return () => clearTimeout(t);
  }, [error]);

  if (!error) return null;
  console.log("Global err called",error)
  return (
    <ToastAlert
      type="destructive"
      message="Error"
      description={error}
    />
  );
}
