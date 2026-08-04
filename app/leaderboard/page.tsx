import styles from "./page.module.css";
import { prisma } from "../../lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);

  // Fetch top 50 users ordered by xp
  const topUsers = await prisma.user.findMany({
    orderBy: { xp: 'desc' },
    take: 50,
    select: {
      id: true,
      name: true,
      email: true,
      xp: true,
      streak: true,
      submissions: {
        where: { status: 'Accepted' },
        select: { problemId: true }
      }
    }
  });

  // Calculate unique problems solved
  const formattedUsers = topUsers.map((user, index) => {
    const uniqueProblems = new Set(user.submissions.map(s => s.problemId)).size;
    return {
      ...user,
      rank: index + 1,
      problemsSolved: uniqueProblems,
    };
  });

  const podium = [
    formattedUsers[1], // Silver
    formattedUsers[0], // Gold
    formattedUsers[2]  // Bronze
  ].filter(Boolean); // Remove nulls if less than 3 users

  const restOfUsers = formattedUsers.slice(3);

  let currentUserRank = null;
  let isCurrentUserInTop50 = false;
  
  if (session?.user?.email) {
    isCurrentUserInTop50 = formattedUsers.some(u => u.email === session.user?.email);
    
    if (!isCurrentUserInTop50) {
      const currentUserData = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true, name: true, email: true, xp: true, streak: true,
          submissions: { where: { status: 'Accepted' }, select: { problemId: true } }
        }
      });
      
      if (currentUserData) {
        const higherRankedCount = await prisma.user.count({
          where: { xp: { gt: currentUserData.xp } }
        });
        
        currentUserRank = {
          ...currentUserData,
          rank: higherRankedCount + 1,
          problemsSolved: new Set(currentUserData.submissions.map(s => s.problemId)).size,
        };
      }
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Global Leaderboard</h1>
        <p>Rankings based on Total XP. Solve problems and maintain your streak to climb the ladder!</p>
      </header>

      {podium.length > 0 && (
        <div className={styles.podium}>
          {podium.map((user) => (
            <div 
              key={user.id} 
              className={`${styles.podiumItem} ${user.rank === 1 ? styles.rank1 : user.rank === 2 ? styles.rank2 : styles.rank3}`}
            >
              <div className={styles.rankBadge} style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                {user.rank === 1 ? '👑' : user.rank === 2 ? '🥈' : '🥉'}
              </div>
              <div className={styles.podiumAvatar}>
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className={styles.podiumName}>{user.name || 'Anonymous'}</div>
              <div className={styles.podiumXp}>{user.xp} XP</div>
            </div>
          ))}
        </div>
      )}

      {restOfUsers.length > 0 && (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Rank</th>
                <th>User</th>
                <th>Problems Solved</th>
                <th>Streak</th>
                <th>Total XP</th>
              </tr>
            </thead>
            <tbody>
              {restOfUsers.map((user) => {
                const isCurrentUser = session?.user?.email === user.email;
                return (
                  <tr 
                    key={user.id} 
                    style={isCurrentUser ? { background: 'rgba(168, 85, 247, 0.1)' } : {}}
                  >
                    <td className={styles.rankCell}>#{user.rank}</td>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.smallAvatar} style={isCurrentUser ? { background: '#a855f7', color: '#fff' } : {}}>
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span style={isCurrentUser ? { fontWeight: 700, color: '#a855f7' } : { fontWeight: 500 }}>
                          {user.name || 'Anonymous'} {isCurrentUser && "(You)"}
                        </span>
                      </div>
                    </td>
                    <td>{user.problemsSolved}</td>
                    <td>{user.streak} 🔥</td>
                    <td className={styles.xpCell}>{user.xp}</td>
                  </tr>
                );
              })}
              
              {currentUserRank && (
                <>
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '0.5rem' }}>
                      ...
                    </td>
                  </tr>
                  <tr style={{ background: 'rgba(168, 85, 247, 0.1)', borderTop: '2px solid var(--border-color)' }}>
                    <td className={styles.rankCell}>#{currentUserRank.rank}</td>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.smallAvatar} style={{ background: '#a855f7', color: '#fff' }}>
                          {currentUserRank.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span style={{ fontWeight: 700, color: '#a855f7' }}>
                          {currentUserRank.name || 'Anonymous'} (You)
                        </span>
                      </div>
                    </td>
                    <td>{currentUserRank.problemsSolved}</td>
                    <td>{currentUserRank.streak} 🔥</td>
                    <td className={styles.xpCell}>{currentUserRank.xp}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
