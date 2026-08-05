import { prisma } from "@/lib/db";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function StudyPlansPage() {
  const session = await getServerSession(authOptions);
  const plans = await prisma.studyPlan.findMany({
    include: {
      _count: {
        select: { problems: true }
      }
    }
  });

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Study Plans
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Curated roadmaps to help you master specific topics and ace your interviews.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        {plans.map((plan) => (
          <Link href={`/plans/${plan.slug}`} key={plan.id} style={{ textDecoration: 'none' }}>
            <div className="planCard" style={{ 
              background: 'var(--bg-secondary)', 
              padding: '2rem', 
              borderRadius: 'var(--radius-lg)', 
              border: '1px solid var(--border-color)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s ease, border-color 0.2s ease',
              cursor: 'pointer'
            }}>
              <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{plan.title}</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1 }}>{plan.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                <span>{plan._count.problems} Problems</span>
                <span style={{ color: 'var(--accent-primary)' }}>Start &rarr;</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
