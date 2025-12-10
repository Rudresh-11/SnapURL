"use client";

import { useEffect } from "react";
import { useErrorStore } from "@/store/useErrorStore";
import ToastAlert from "@/components/alertdialog.js";

export default function GlobalErrorListener() {
  let { error, clearError } = useErrorStore();

  useEffect(() => {
    if (!error) return;

    const t = setTimeout(() => clearError(), 3000);
    return () => clearTimeout(t);
  }, [error]);

  if (!error) return null;
  if (error==="timeout of 10000ms exceeded"){
    error = "Our backend server is Starting up Please wait upto 7-8 seconds then try again"
  }
  return (
    <ToastAlert
      type="destructive"
      message="Error"
      description={error}
    />
  );
}
