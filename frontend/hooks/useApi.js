"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import api from "@/lib/api";

export default function useApi(
  endpoint,
  { auto = false, method = "GET", body = null } = {}
) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(auto);
  const [error, setError] = useState(null);
  const errorRef = useRef(null);

  const request = useCallback(
    async (overrideBody = null, overrideUrl = null, overrideMethod = null) => {
      setLoading(true);
      setError(null);
      errorRef.current = null;

      try {
        const res = await api.request({
          url: overrideUrl || endpoint,
          method: overrideMethod || method,
          data: overrideBody ?? body,
        });

        setData(res.data);
        return res.data;
      } catch (err) {
        const msg = err.response?.data?.message || err.message || "API Error";
        
        errorRef.current = msg;
        setError(msg);

        return null;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, method, body]
  );

  // auto-fetch on mount
  useEffect(() => {
    if (!auto) return; // wait for token
    request();
  }, [auto]);

  return {
    data,
    loading,
    error,
    request,
    setData,
    get error() {
      return errorRef.current;
    }
  };
}
