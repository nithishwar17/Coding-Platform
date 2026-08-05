"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function SolutionsTab({ problemId }: { problemId: number }) {
  const [solutions, setSolutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSolution, setSelectedSolution] = useState<any>(null);

  const fetchSolutions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/solutions?problemId=${problemId}`);
      const data = await res.json();
      if (data.solutions) {
        setSolutions(data.solutions);
      }
    } catch (err) {
      console.error("Failed to fetch solutions", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSolutions();
  }, [problemId]);

  const handleUpvote = async (solutionPostId: string) => {
    try {
      const res = await fetch('/api/solutions/upvote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ solutionPostId })
      });
      if (res.ok) {
        // Refresh solutions to get updated upvote count
        fetchSolutions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading solutions...</div>;

  if (selectedSolution) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <button 
          className="btn btn-secondary" 
          onClick={() => setSelectedSolution(null)} 
          style={{ alignSelf: 'flex-start', marginBottom: '1rem', padding: '0.4rem 0.8rem' }}
        >
          &larr; Back to Solutions
        </button>
        <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>{selectedSolution.title}</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            <span>By @{selectedSolution.user?.name || 'anonymous'}</span>
            <span>{selectedSolution.submission.language} • {selectedSolution.submission.executionTime}ms</span>
          </div>
          {selectedSolution.description && (
            <p style={{ marginBottom: '1rem', lineHeight: '1.5' }}>{selectedSolution.description}</p>
          )}
          <pre style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', overflowX: 'auto', fontFamily: 'var(--font-geist-mono)', border: '1px solid var(--border-color)' }}>
            {selectedSolution.submission.code}
          </pre>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
             <button className="btn btn-secondary" onClick={() => handleUpvote(selectedSolution.id)}>
               👍 Upvote ({selectedSolution._count?.upvotes || 0})
             </button>
          </div>
        </div>
      </div>
    );
  }

  if (solutions.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>
        No solutions posted yet. Be the first to share your solution!
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>Community Solutions</h2>
      {solutions.map((sol: any) => (
        <div 
          key={sol.id} 
          onClick={() => setSelectedSolution(sol)}
          style={{ 
            padding: '1rem', 
            background: 'var(--bg-secondary)', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--border-color)',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'border-color 0.2s ease'
          }}
          className={styles.solutionCard}
        >
          <div>
            <div style={{ fontWeight: '500', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{sol.title}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              @{sol.user?.name || 'anonymous'} • {sol.submission.language} • {sol.submission.executionTime}ms
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              👍 {sol._count?.upvotes || 0}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
