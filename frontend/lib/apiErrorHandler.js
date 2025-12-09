"use client";

import ToastAlert from "@/components/alertdialog";// or your shadcn toast
import { description } from "@/components/analytics/horizontalBarchart";

export function handleApiError(error, showToast = true) {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again.";
  if (showToast) {
    const alert = {type:"destructive",message:"Api error",description:message}
    return <ToastAlert {...alert} />
  }

  return message;
}
