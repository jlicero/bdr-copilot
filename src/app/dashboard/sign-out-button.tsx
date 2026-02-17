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
        padding: "8px 16px",
        fontSize: 13,
        border: "1px solid #ccc",
        borderRadius: 6,
        background: "#fff",
        cursor: "pointer",
      }}
    >
      {t.signOut}
    </button>
  );
}
