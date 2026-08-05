import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import styles from "./layout.module.css";
import Link from "next/link";
import { ThemeProvider } from "./ThemeProvider";
import { ThemeToggle } from "./ThemeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import AuthProvider from "./SessionProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import { LogoutButton } from "./LogoutButton";

export const metadata: Metadata = {
  title: "CodeCook | Elevate Your Coding",
  description: "A comprehensive coding platform combining practice, learning, and community.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body>
        <AuthProvider>
          <ThemeProvider>
            <header className={styles.header}>
              <Link href="/" className={styles.logo}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>CodeCook</span>
              </Link>
              <nav className={styles.nav}>
                {session && (
                  <>
                    <Link href="/dashboard" className={styles.navLink}>Dashboard</Link>
                    <Link href="/problems" className={styles.navLink}>Problems</Link>
                    <Link href="/playground" className={styles.navLink}>Playground</Link>
                    <Link href="/plans" className={styles.navLink}>Plans</Link>
                    <Link href="/leaderboard" className={styles.navLink}>Leaderboard</Link>
                    <Link href="/profile" className={styles.navLink}>Profile</Link>
                  </>
                )}
              </nav>
              <div className={styles.userProfile}>
                <div className="flex-center" style={{ gap: '0.75rem', marginRight: '1rem' }}>
                  <ThemeToggle />
                  {!session && (
                    <Link href="/login" className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
                      Log In
                    </Link>
                  )}
                </div>
                {session && (
                  <div className="flex-center">
                    <span style={{ marginRight: '0.75rem', fontWeight: 500, fontSize: '0.95rem' }}>{session.user?.name}</span>
                    <div className={styles.avatar}>{session.user?.name?.charAt(0).toUpperCase() || 'U'}</div>
                    <LogoutButton />
                  </div>
                )}
              </div>
            </header>
            <main className={styles.mainContent}>
              {children}
            </main>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
