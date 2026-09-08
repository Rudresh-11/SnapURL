"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const EXIT_MS = 300;

const mounted = [];
const subscribers = new Set();

function notify() {
  subscribers.forEach((fn) => fn());
}

export default function ToastAlert({
  type = "success",
  message = "Request successful",
  description = "Request has been processed successfully",
  duration = 5000,
}) {
  const [visible, setVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);
  const [index, setIndex] = useState(0);
  const idRef = useRef({});

  useEffect(() => {
    const id = idRef.current;
    mounted.push(id);

    const sync = () => setIndex(Math.max(0, mounted.indexOf(id)));
    subscribers.add(sync);
    sync();
    notify();

    return () => {
      const at = mounted.indexOf(id);
      if (at !== -1) mounted.splice(at, 1);
      subscribers.delete(sync);
      notify();
    };
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const hideTimer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(hideTimer);
  }, [duration]);

  useEffect(() => {
    if (visible) return;
    const unmountTimer = setTimeout(() => setShouldRender(false), EXIT_MS);
    return () => clearTimeout(unmountTimer);
  }, [visible]);

  if (!shouldRender) return null;

  const isSuccess = type === "success";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        fixed right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm
        transition-all duration-300 ease-out
        ${visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}
      `}
      style={{ bottom: 16 + index * 88 }}
    >
      <Alert
        variant={isSuccess ? "success" : "destructive"}
        className="bg-popover text-popover-foreground shadow-lg"
      >
        {isSuccess ? <CheckCircle2Icon /> : <AlertCircleIcon />}
        <AlertTitle>{message}</AlertTitle>
        <AlertDescription className="break-words">{description}</AlertDescription>
      </Alert>
    </div>
  );
}
