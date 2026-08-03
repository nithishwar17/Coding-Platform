"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="btn btn-secondary"
      style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', marginLeft: '0.75rem' }}
    >
      Sign Out
    </button>
  );
}
