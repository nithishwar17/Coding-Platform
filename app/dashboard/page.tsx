import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { getDailyChallenge } from "@/lib/dailyChallenge";

export const metadata = {
  title: "Dashboard - CodeNexus",
  description: "View your progress and jump back into coding.",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Fetch fresh user data to get accurate XP and Streak
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      submissions: {
        where: { status: "Accepted" }
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  // Calculate unique problems solved based on Accepted submissions
  const uniqueSolved = new Set(user.submissions.map(s => s.problemId)).size;
  const dailyChallenge = await getDailyChallenge();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.greeting}>Welcome back, {user.name?.split(' ')[0] || "Coder"}!</h1>
          <p className="text-secondary" style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>Ready to crush some code today?</p>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total XP</div>
          <div className={styles.statValue}>{user.xp.toLocaleString()}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Current Streak</div>
          <div className={styles.statValue}>
            {user.streak} <span style={{ fontSize: '1.5rem', verticalAlign: 'middle' }}>🔥</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Problems Solved</div>
          <div className={styles.statValue}>{uniqueSolved}</div>
        </div>
      </div>

      <h2 style={{ marginBottom: '1.5rem', fontWeight: 600, fontSize: '1.5rem' }}>Quick Actions</h2>
      <div className={styles.actionsGrid}>
        {dailyChallenge && (
          <Link href={`/playground?id=${dailyChallenge.id}`} className={styles.actionCard} style={{ borderColor: 'var(--color-primary)', background: 'var(--bg-tertiary)' }}>
            <div className={styles.actionTitle} style={{ color: 'var(--color-primary)' }}>🔥 Daily Challenge</div>
            <div className={styles.actionDesc}><strong>{dailyChallenge.title}</strong><br/>Solve today's selected challenge to keep your streak alive!</div>
          </Link>
        )}
        <Link href="/problems" className={styles.actionCard}>
          <div className={styles.actionTitle}>📚 Browse Problems</div>
          <div className={styles.actionDesc}>Explore our library of coding challenges across different difficulties and topics. Filter by what you want to learn next.</div>
        </Link>
        <Link href="/playground" className={styles.actionCard}>
          <div className={styles.actionTitle}>💻 Open Playground</div>
          <div className={styles.actionDesc}>Jump right into the code editor and start testing your ideas in our secure, lightning-fast sandbox environment.</div>
        </Link>
        <Link href="/leaderboard" className={styles.actionCard}>
          <div className={styles.actionTitle}>🏆 View Leaderboard</div>
          <div className={styles.actionDesc}>See how you stack up against other developers in the global rankings and push for the top spot.</div>
        </Link>
      </div>
    </div>
  );
}
