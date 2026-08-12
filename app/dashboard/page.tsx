import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { getDailyChallenge } from "@/lib/dailyChallenge";
import Heatmap from "./Heatmap";

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
      submissions: true
    }
  });

  if (!user) {
    redirect("/force-logout");
  }

  const allProblems = await prisma.problem.findMany({ select: { id: true, difficulty: true } });
  
  const totalEasy = allProblems.filter(p => p.difficulty === 'Easy').length;
  const totalMedium = allProblems.filter(p => p.difficulty === 'Medium').length;
  const totalHard = allProblems.filter(p => p.difficulty === 'Hard').length;

  // Calculate unique problems solved based on Accepted submissions
  const solvedIds = new Set(user.submissions.filter(s => s.status === "Accepted").map(s => s.problemId));
  const uniqueSolved = solvedIds.size;
  
  const solvedEasy = allProblems.filter(p => p.difficulty === 'Easy' && solvedIds.has(p.id)).length;
  const solvedMedium = allProblems.filter(p => p.difficulty === 'Medium' && solvedIds.has(p.id)).length;
  const solvedHard = allProblems.filter(p => p.difficulty === 'Hard' && solvedIds.has(p.id)).length;

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

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '2rem', padding: '1.5rem', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <span style={{ fontWeight: 500, color: 'var(--success)' }}>Easy</span>
            <span style={{ color: 'var(--text-secondary)' }}>{solvedEasy} / {totalEasy}</span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ width: `${totalEasy > 0 ? (solvedEasy / totalEasy) * 100 : 0}%`, height: '100%', backgroundColor: 'var(--success)' }} />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <span style={{ fontWeight: 500, color: 'var(--warning)' }}>Medium</span>
            <span style={{ color: 'var(--text-secondary)' }}>{solvedMedium} / {totalMedium}</span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ width: `${totalMedium > 0 ? (solvedMedium / totalMedium) * 100 : 0}%`, height: '100%', backgroundColor: 'var(--warning)' }} />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <span style={{ fontWeight: 500, color: 'var(--error)' }}>Hard</span>
            <span style={{ color: 'var(--text-secondary)' }}>{solvedHard} / {totalHard}</span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ width: `${totalHard > 0 ? (solvedHard / totalHard) * 100 : 0}%`, height: '100%', backgroundColor: 'var(--error)' }} />
          </div>
        </div>
      </div>

      <Heatmap submissions={user.submissions} />

      <h2 style={{ marginBottom: '1.5rem', marginTop: '2rem', fontWeight: 600, fontSize: '1.5rem' }}>Recent Submissions</h2>
      <div style={{ background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden', marginBottom: '2rem' }}>
        {user.submissions.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Problem</th>
                <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Language</th>
                <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {user.submissions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5).map(sub => {
                const problem = allProblems.find(p => p.id === sub.problemId);
                return (
                  <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem' }}>
                      <Link href={`/playground?id=${sub.problemId}`} style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}>
                        {problem?.title || `Problem ${sub.problemId}`}
                      </Link>
                    </td>
                    <td style={{ padding: '1rem', color: sub.status === 'Accepted' ? 'var(--success)' : 'var(--error)', fontWeight: 500 }}>
                      {sub.status}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {sub.language}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No submissions yet. Time to solve your first problem!
          </div>
        )}
      </div>

      <h2 style={{ marginBottom: '1.5rem', marginTop: '2rem', fontWeight: 600, fontSize: '1.5rem' }}>Quick Actions</h2>
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
