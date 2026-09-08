import { QrCode } from "lucide-react";
import ComingSoon from "@/components/coming-soon";

export const metadata = { title: "QR Codes · SnapURL" };

export default function QRComingSoonPage() {
  return (
    <ComingSoon
      icon={QrCode}
      title="QR codes are on the way"
      description="Soon you'll be able to generate a scannable code for any SnapURL link and track scans alongside clicks."
    />
  );
}
