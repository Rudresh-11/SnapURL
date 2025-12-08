"use client";

import Image from "next/image";

export default function QRComingSoonPage() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center px-4 mt-[-100px]">
      
      {/* Centered Illustration */}
      <Image
        src="/vector/qr.jpg"
        alt="QR Feature Coming Soon"
        width={500}
        height={500}
        className="object-contain"
      />

      {/* Text Below */}
      <p className="mt-6 text-xl text-gray-600 font-medium text-center">
        This feature will be available soon
      </p>
      
    </div>
  );
}
