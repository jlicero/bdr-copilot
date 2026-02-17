"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

export default function SignOutButton() {
  const router = useRouter();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      style={{
        padding: "6px 14px",
        fontSize: 12,
        fontWeight: 600,
        border: "1px solid var(--border-strong)",
        borderRadius: 6,
        background: "transparent",
        color: "var(--text-muted)",
        cursor: "pointer",
        transition: "all 0.15s",
        letterSpacing: "0.02em",
      }}
    >
      {t.signOut}
    </button>
  );
}
