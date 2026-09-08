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
  const [errorStatus, setErrorStatus] = useState(null);

  const errorRef = useRef(null);

  const bodyRef = useRef(body);
  useEffect(() => {
    bodyRef.current = body;
  }, [body]);

  const request = useCallback(
    async (overrideBody = null, overrideUrl = null, overrideMethod = null) => {
      setLoading(true);
      setError(null);
      setErrorStatus(null);
      errorRef.current = null;

      try {
        const res = await api.request({
          url: overrideUrl || endpoint,
          method: overrideMethod || method,
          data: overrideBody ?? bodyRef.current,
        });

        setData(res.data);
        return res.data;
      } catch (err) {
        const msg = err.response?.data?.message || err.message || "API Error";

        errorRef.current = msg;
        setError(msg);
        setErrorStatus(err.response?.status ?? null);

        return null;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, method]
  );

  useEffect(() => {
    if (!auto) return;
    request();
  }, [auto, request]);

  return {
    data,
    loading,
    error,
    errorStatus,
    errorRef,
    request,
    setData,
  };
}
