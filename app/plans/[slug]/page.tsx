import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function StudyPlanDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  
  const plan = await prisma.studyPlan.findUnique({
    where: { slug: slug },
    include: {
      problems: {
        orderBy: { order: 'asc' },
        include: {
          problem: {
            select: { id: true, title: true, difficulty: true, tags: true }
          }
        }
      }
    }
  });

  if (!plan) {
    notFound();
  }

  // Get user's accepted submissions for these problems to show checkmarks
  let solvedProblemIds = new Set<number>();
  if ((session?.user as any)?.id) {
    const submissions = await prisma.submission.findMany({
      where: {
        userId: (session?.user as any)?.id,
        status: 'Accepted',
        problemId: {
          in: plan.problems.map(p => p.problemId)
        }
      },
      select: { problemId: true }
    });
    submissions.forEach(sub => solvedProblemIds.add(sub.problemId));
  }

  const completedCount = solvedProblemIds.size;
  const totalCount = plan.problems.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <Link href="/plans" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' }}>
        &larr; Back to Plans
      </Link>
      
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{plan.title}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>{plan.description}</p>
        
        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            <span>Progress</span>
            <span style={{ fontWeight: 'bold' }}>{completedCount} / {totalCount} ({progressPercent}%)</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--success)', transition: 'width 0.3s ease' }}></div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {plan.problems.map((pp, index) => {
          const p = pp.problem;
          const isSolved = solvedProblemIds.has(p.id);
          return (
            <Link href={`/playground?id=${p.id}`} key={p.id} style={{ textDecoration: 'none' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '1.25rem', 
                background: 'var(--bg-secondary)', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border-color)',
                transition: 'border-color 0.2s',
                gap: '1rem'
              }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: isSolved ? 'var(--success)' : 'transparent', border: isSolved ? 'none' : '2px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                  {isSolved && <span style={{ fontSize: '12px', fontWeight: 'bold' }}>✓</span>}
                </div>
                <div style={{ color: 'var(--text-secondary)', width: '30px', fontWeight: 'bold' }}>
                  {index + 1}.
                </div>
                <div style={{ flex: 1, color: 'var(--text-primary)', fontWeight: '500' }}>
                  {p.title}
                </div>
                <div style={{ 
                  color: p.difficulty === 'Easy' ? 'var(--success)' : p.difficulty === 'Medium' ? 'var(--warning)' : 'var(--error)',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  width: '80px',
                  textAlign: 'right'
                }}>
                  {p.difficulty}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
