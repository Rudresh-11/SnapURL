"use client";

import { useEffect, useState } from "react";
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ToastAlert({
  type = "success",
  message = "Request successful",
  description = "Request has been processed successfully",
  duration = 3000, // auto hide
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(t);
  }, [duration]);

  if (!visible) return null;

  return (
    <div
      className={`
        fixed bottom-6 right-6
        transition-all duration-500 ease-out
        transform 
        ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
        z-50
      `}
    >
      {type === "success" ? (
        <Alert variant="success" className="shadow-lg">
          <CheckCircle2Icon />
          <AlertTitle>{message}</AlertTitle>
          <AlertDescription>{description}</AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive" className="shadow-lg">
          <AlertCircleIcon className="text-red-600" />
          <AlertTitle>{message}</AlertTitle>
          <AlertDescription>{description}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
