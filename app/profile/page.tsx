import styles from "./page.module.css";
import { prisma } from "../../lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || !(session.user as any).id) {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    redirect("/login");
  }

  const submissions = await prisma.submission.findMany({
    where: { userId },
    include: { problem: true }
  });

  // Calculate Metrics
  const problemsSolved = new Set(submissions.filter(s => s.status === 'Accepted').map(s => s.problemId)).size;
  const totalSubmissions = submissions.length;

  // Language Stats
  const languageCounts = submissions.reduce((acc, sub) => {
    acc[sub.language] = (acc[sub.language] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const languageStats = Object.entries(languageCounts)
    .map(([lang, count]) => ({ lang, percentage: Math.round((count / totalSubmissions) * 100) }))
    .sort((a, b) => b.percentage - a.percentage);

  // Strong Topics (Tags from Accepted Submissions)
  const tagCounts = submissions
    .filter(s => s.status === 'Accepted')
    .flatMap(s => s.problem.tags.split(','))
    .reduce((acc, tag) => {
      const t = tag.trim();
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag, count]) => ({
      tag,
      level: count >= 5 ? 'Master' : count >= 3 ? 'Advanced' : 'Intermediate',
      color: count >= 5 ? 'var(--accent-primary)' : count >= 3 ? 'var(--success)' : 'var(--warning)'
    }));

  return (
    <div className={`container ${styles.profilePage}`}>
      
      {/* Sidebar Info */}
      <aside>
        <div className={`card ${styles.userInfoCard}`}>
          <div className={styles.avatar}>{user.name?.[0]?.toUpperCase() || 'U'}</div>
          <h1 className={styles.username}>{user.name}</h1>
          <div className={styles.userHandle}>@{user.email?.split('@')[0]}</div>
          
          <div className={styles.rankBadge}>Knight ({user.xp} XP)</div>
          
          <div className={styles.statsList}>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Day Streak</span>
              <span className={styles.statValue}>{user.streak}</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Contest Rating</span>
              <span className={styles.statValue}>1,840</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Problems Solved</span>
              <span className={styles.statValue}>{problemsSolved}</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Total Submissions</span>
              <span className={styles.statValue}>{totalSubmissions}</span>
            </div>
          </div>

          <button className="btn btn-secondary" style={{ width: '100%', marginTop: '2rem' }}>
            Export Portfolio
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={styles.mainContent}>
        
        {/* Resume Analytics */}
        <section>
          <h2>Resume Analytics</h2>
          <p className="text-secondary" style={{ marginBottom: '1rem' }}>Strengths and focus areas to showcase.</p>
          
          <div className={styles.analyticsGrid}>
            <div className={`card ${styles.chartCard}`}>
              <h3>Strong Topics</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {topTags.length > 0 ? topTags.map(t => (
                  <li key={t.tag} className="flex-between">
                    <span>{t.tag}</span> 
                    <span style={{color: t.color}}>{t.level}</span>
                  </li>
                )) : <li className="text-secondary">Solve problems to see strong topics.</li>}
              </ul>
            </div>
            <div className={`card ${styles.chartCard}`}>
              <h3>Languages Used</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {languageStats.length > 0 ? languageStats.map(l => (
                  <li key={l.lang} className="flex-between">
                    <span style={{textTransform: 'capitalize'}}>{l.lang}</span> 
                    <span>{l.percentage}%</span>
                  </li>
                )) : <li className="text-secondary">Submit code to see language stats.</li>}
              </ul>
            </div>
          </div>
        </section>

        {/* Achievements Showcase */}
        <section>
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <h2>Achievements</h2>
            <span className="text-secondary">8 / 50 Unlocked</span>
          </div>
          
          <div className={styles.achievementsGrid}>
            <div className={styles.badgeCard}>
              <div className={styles.badgeIcon}>🔥</div>
              <div className={styles.badgeTitle}>7-Day Streak</div>
              <div className={styles.badgeDesc}>Coded 7 days in a row</div>
            </div>
            <div className={styles.badgeCard}>
              <div className={styles.badgeIcon}>💯</div>
              <div className={styles.badgeTitle}>Centurion</div>
              <div className={styles.badgeDesc}>Solved 100 problems</div>
            </div>
            <div className={styles.badgeCard}>
              <div className={styles.badgeIcon}>👑</div>
              <div className={styles.badgeTitle}>First AC</div>
              <div className={styles.badgeDesc}>Got an accepted solution</div>
            </div>
            <div className={styles.badgeCard}>
              <div className={styles.badgeIcon}>⚡</div>
              <div className={styles.badgeTitle}>Early Bird</div>
              <div className={styles.badgeDesc}>Solved before 8 AM</div>
            </div>
            
            {/* Locked Badges */}
            <div className={styles.badgeCard} style={{ opacity: 0.5, filter: 'grayscale(1)' }}>
              <div className={styles.badgeIcon}>🔷</div>
              <div className={styles.badgeTitle}>Diamond Streak</div>
              <div className={styles.badgeDesc}>30-Day Streak</div>
            </div>
            <div className={styles.badgeCard} style={{ opacity: 0.5, filter: 'grayscale(1)' }}>
              <div className={styles.badgeIcon}>🚀</div>
              <div className={styles.badgeTitle}>Contest Winner</div>
              <div className={styles.badgeDesc}>Rank in top 100</div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
