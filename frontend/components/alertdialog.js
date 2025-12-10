"use client";

import { useEffect, useState } from "react";
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// WARNING: Global variables like this can cause issues in complex apps.
// Ideally, use a Context or a Toast library (like Sonner or React-Hot-Toast) for stacking.
let alertCount = 0;

export default function ToastAlert({
  type = "success",
  message = "Request successful",
  description = "Request has been processed successfully",
  duration = 8000, // Reduced default for testing
}) {
  const [visible, setVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true); // New state to control DOM presence
  const [offset, setOffset] = useState(0);

  // Handle stacking logic
  useEffect(() => {
    alertCount++;
    const index = alertCount - 1;
    setOffset(index * 90);

    return () => {
      alertCount--;
    };
  }, []);

  // Handle Auto-hide and Animation logic
  useEffect(() => {
    // 1. Wait for 'duration', then start the fade-out animation
    const hideTimer = setTimeout(() => {
      console.log("hide timer 8 seconds dine")
      setVisible(false);
    }, duration);

    return () => clearTimeout(hideTimer); // cleanup
  }, [duration]);

  // 2. Wait for the fade-out animation (500ms) to finish, then unmount from DOM
  useEffect(() => {
    if (!visible) {
      const unmountTimer = setTimeout(() => {
        setShouldRender(false);
      }, 500); // Matches the 'duration-500' in CSS

      return () => clearTimeout(unmountTimer);
    }
  }, [visible]);

  // Only return null AFTER the animation has finished
  if (!shouldRender) return null;

  return (
    <div
      className={`
        fixed right-6
        transition-all duration-500 ease-in-out
        transform
        ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
        z-50
      `}
      style={{ bottom: 20 + offset }}
    >
      {type === "success" ? (
        <Alert variant="success" className="shadow-lg w-[350px] bg-white">
          <CheckCircle2Icon className="text-green-600" />
          <AlertTitle >{message}</AlertTitle>
          <AlertDescription >
            {description}
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive" className="shadow-lg w-[350px] bg-white">
          <AlertCircleIcon className="text-red-600" />
          <AlertTitle >{message}</AlertTitle>
          <AlertDescription >
            {description}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}