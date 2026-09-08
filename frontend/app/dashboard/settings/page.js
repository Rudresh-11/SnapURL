import { Settings } from "lucide-react";
import ComingSoon from "@/components/coming-soon";

export const metadata = { title: "Settings · SnapURL" };

export default function SettingsComingSoonPage() {
  return (
    <ComingSoon
      icon={Settings}
      title="Settings are coming soon"
      description="Profile details, custom domains, and team access will live here. For now your account works with its sign-in email."
    />
  );
}
