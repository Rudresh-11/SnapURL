"use client";

import { useParams, notFound } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function RedirectPage() {
  const { shortcode } = useParams();
  const [nf, setNf] = useState(false);
  const [error, setError] = useState(null)

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await api.request({
          url: `${process.env.NEXT_PUBLIC_API_REDIRECT_URL}/${shortcode}?check=true`,
          method: "GET",
          validateStatus: () => true // <── allow axios to return 404 instead of throwing
        });

        // Check both conditions
        if (res.status === 404 || res.data?.message === "Url not found") {
          setNf(true);
          return;
        }
        if (res.status < 200 || res.status >= 300) {
          setError(res.data?.message || "Something went wrong");
          return;
        }
        // 🔥 If valid, now perform the actual redirect
        const realRef = document.referrer;
        let url = `${process.env.NEXT_PUBLIC_API_REDIRECT_URL}/${shortcode}`;
        url += realRef ? `?ref=${encodeURIComponent(realRef)}` : `?ref=Direct`;

        window.location.href = url;

      } catch (error) {
        console.log("Redirect check error:", error);
        setError(`Somthing unexpected happend`)
      }
    };

    verify();
  }, [shortcode]);

  if (nf) return notFound();

  if (error) {
    return (
      <div className="text-center mt-10 text-red-600 font-medium">
        {error}
      </div>
    );
  }

  return <p className="text-center mt-10">Redirecting...</p>;;
}
