"use client";

import { useEffect, useRef } from "react";

export default function useGoogleSignIn(onCredential, { width = 400 } = {}) {
  const buttonRef = useRef(null);

  const callbackRef = useRef(onCredential);
  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    let cancelled = false;
    let timer;

    const render = () => {
      if (cancelled || !buttonRef.current) return false;
      if (!window.google?.accounts?.id) return false;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => callbackRef.current?.(response),
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "continue_with",
        width: Math.min(width, buttonRef.current.offsetWidth || width),
      });

      return true;
    };

    if (!render()) {
      timer = setInterval(() => {
        if (render()) clearInterval(timer);
      }, 150);
    }

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [width]);

  return buttonRef;
}
