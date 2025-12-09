import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from '@vercel/analytics/next';
import GlobalErrorListener from "@/components/global-error-listener";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SnapURL - URL Shortener Service",
  description: "A simple and efficient URL shortening service to create, manage, and analyze short links.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Analytics debug={false} />
        <GlobalErrorListener/>
        {children}
      </body>
    </html>
  );
}
