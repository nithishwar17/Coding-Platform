import styles from "./page.module.css";
import Link from "next/link";
import { prisma } from "../lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Fetch actual user stats
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  const xp = user?.xp || 0;
  const streak = user?.streak || 0;
  const level = Math.floor(xp / 500) + 1;
  const nextLevelXp = level * 500;
  const xpToNext = nextLevelXp - xp;

  // Mock data for the heatmap (7 days * 52 weeks = 364 days approx)
  const heatmapData = Array.from({ length: 364 }).map(() => {
    // Generate random activity level (0-4)
    return Math.random() > 0.6 ? Math.floor(Math.random() * 4) + 1 : 0;
  });

  // Fetch a problem for the daily challenge
  const dailyProblem = await prisma.problem.findFirst();

  return (
    <div className={`container ${styles.dashboard}`}>
      <div className={styles.mainColumn}>
        <section className={styles.welcomeSection}>
          <h1 style={{ fontWeight: 600, letterSpacing: '-0.02em' }}>Welcome back, {user?.name || 'User'}!</h1>
          <p className="text-secondary">Ready to conquer your daily challenges?</p>
        </section>

        <section className={styles.statsGrid}>
          <div className={`card ${styles.statCard}`}>
            <div className={styles.statLabel}>Current Streak</div>
            <div className={styles.statValue}>{streak} Days <span style={{fontSize: '1.5rem'}}>🔥</span></div>
            <div className={styles.statLabel} style={{color: 'var(--success)'}}>On track for Diamond Badge</div>
          </div>
          <div className={`card ${styles.statCard}`}>
            <div className={styles.statLabel}>Total XP</div>
            <div className={styles.statValue}>{xp.toLocaleString()} XP</div>
            <div className={styles.statLabel}>Level {level} - {xpToNext} XP to next level</div>
          </div>
          <div className={`card ${styles.statCard}`}>
            <div className={styles.statLabel}>Problems Solved</div>
            <div className={styles.statValue}>142</div>
            <div className={styles.statLabel}>Top 15% this month</div>
          </div>
        </section>

        <section className="card">
          <h2>Activity Heatmap</h2>
          <p className="text-secondary">Your coding consistency over the last year.</p>
          <div className={styles.heatmapContainer}>
            <div className={styles.heatmapGrid}>
              {heatmapData.map((level, i) => (
                <div 
                  key={i} 
                  className={styles.heatmapCell} 
                  data-level={level}
                  title={`${level > 0 ? level + ' contributions' : 'No activity'}`}
                />
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className={styles.sideColumn}>
        <section className={`card ${styles.challengeCard}`}>
          <h2>Smart Daily Challenge</h2>
          <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Curated by AI Mentor based on your recent weak spots.
          </p>
          
          <div className={styles.challengeTags}>
            <span className={`${styles.tag} ${styles.hard}`}>{dailyProblem?.difficulty || 'Hard'}</span>
            <span className={styles.tag}>{dailyProblem?.tags.split(',')[0] || 'Algorithm'}</span>
          </div>
          
          <h3 style={{ margin: '1rem 0' }}>{dailyProblem?.title || 'Daily Challenge'}</h3>
          
          <Link href={`/playground${dailyProblem ? '?id=' + dailyProblem.id : ''}`} className="btn btn-primary" style={{ width: '100%' }}>
            Solve Challenge
          </Link>
        </section>

        <section className="card">
          <h2>Topic Mastery</h2>
          <div className={styles.topicList}>
            <div className={styles.topicItem}>
              <div className={styles.topicHeader}>
                <span>Arrays</span>
                <span style={{ color: 'var(--success)' }}>95%</span>
              </div>
              <div className={styles.topicBarContainer}>
                <div className={styles.topicBar} style={{ width: '95%' }}></div>
              </div>
            </div>
            <div className={styles.topicItem}>
              <div className={styles.topicHeader}>
                <span>Graphs</span>
                <span style={{ color: 'var(--warning)' }}>60%</span>
              </div>
              <div className={styles.topicBarContainer}>
                <div className={styles.topicBar} style={{ width: '60%', background: 'var(--warning)' }}></div>
              </div>
            </div>
            <div className={styles.topicItem}>
              <div className={styles.topicHeader}>
                <span>Dynamic Programming</span>
                <span style={{ color: 'var(--error)' }}>30%</span>
              </div>
              <div className={styles.topicBarContainer}>
                <div className={styles.topicBar} style={{ width: '30%', background: 'var(--error)' }}></div>
              </div>
            </div>
            <div className={styles.topicItem}>
              <div className={styles.topicHeader}>
                <span>System Design</span>
                <span style={{ color: 'var(--text-tertiary)' }}>10%</span>
              </div>
              <div className={styles.topicBarContainer}>
                <div className={styles.topicBar} style={{ width: '10%', background: 'var(--text-tertiary)' }}></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
