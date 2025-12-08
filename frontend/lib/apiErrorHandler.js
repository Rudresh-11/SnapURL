import ToastAlert from "@/components/alertdialog";// or your shadcn toast

export function handleApiError(error, showToast = true) {
  console.error("API Error:", error);

  const message =
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again.";

  if (showToast) {
    ToastAlert({
      type: "destructive",
      message: "Api Error",
      description: message,
    });
  }

  return message;
}
