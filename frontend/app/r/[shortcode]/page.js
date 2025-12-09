"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function RedirectPage() {
  const { shortcode } = useParams();

  useEffect(() => {
    const realRef = document.referrer;

    let url = `${process.env.NEXT_PUBLIC_API_REDIRECT_URL}/${shortcode}`;

    // only attach ref if browser actually has one
    if (realRef && realRef.trim() !== "") {
      url += `?ref=${encodeURIComponent(realRef)}`;
    }else {
        url+= '?ref=Direct' 
    }

    window.location.href = url;
  }, []);

  return <p className="text-center mt-10">Redirecting...</p>;
}