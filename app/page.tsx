import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import { redirect } from "next/navigation";
import styles from "./landing.module.css";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  // If already logged in, they can go straight to the dashboard.
  // We won't force redirect, but we'll show a "Go to Dashboard" button instead of "Sign In".
  // Actually, redirecting logged-in users is a common pattern for SaaS. Let's keep it.
  if (session?.user?.email) {
    redirect("/dashboard");
  }

  return (
    <div className={styles.landingContainer}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>
              Master Coding Interviews with <span className={styles.highlight}>CodeNexus</span>
            </h1>
            <p className={styles.subtitle}>
              Solve over 5,000 real interview questions, track your progress, and get instant AI-powered feedback.
            </p>
            <div className={styles.ctaGroup}>
              <Link href="/register" className={`btn btn-primary ${styles.ctaButton}`}>
                Start Coding for Free
              </Link>
              <Link href="/problems" className={`btn btn-secondary ${styles.ctaButton}`}>
                Explore Problems
              </Link>
            </div>
          </div>
          
          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <span className={styles.statNumber}>500+</span>
              <span className={styles.statLabel}>Problems</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statNumber}>10k+</span>
              <span className={styles.statLabel}>Submissions</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statNumber}>24/7</span>
              <span className={styles.statLabel}>AI Mentor</span>
            </div>
          </div>
        </section>

        <section className={styles.features}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⚡</div>
            <h3>Lightning Fast Execution</h3>
            <p>Our secure sandbox environment runs your code in milliseconds across 7+ languages.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🤖</div>
            <h3>AI-Powered Mentor</h3>
            <p>Get hints, time complexity analysis, and code reviews directly in the editor.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📈</div>
            <h3>Detailed Analytics</h3>
            <p>Track your streaks, topic mastery, and compare your progress on the global leaderboard.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
