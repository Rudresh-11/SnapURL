"use client";

import { useState, useCallback } from "react";
import api from "@/lib/api";

export default function useApi(
  endpoint,
  { auto = false, method = "GET", body = null } = {}
) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(auto);
  const [error, setError] = useState(null);

  const request = useCallback(
    async (overrideBody = null, overrideUrl = null, overrideMethod = null) => {
      setLoading(true);
      setError(null);

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
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, method, body]
  );

  // auto-fetch on mount
  useState(() => {
    if (auto){
      (async() => {
        await request();
      })();

    }
  });

  return {
    data,
    loading,
    error,
    request,
    setData,
  };
}
