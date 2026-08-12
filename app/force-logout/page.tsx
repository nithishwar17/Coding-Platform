"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function ForceLogoutPage() {
  useEffect(() => {
    signOut({ callbackUrl: "/login" });
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      <p>Clearing your session...</p>
    </div>
  );
}
