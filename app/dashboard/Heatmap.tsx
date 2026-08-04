"use client";

import { useMemo } from "react";
import styles from "./page.module.css";

export default function Heatmap({ submissions }: { submissions: any[] }) {
  // Aggregate submissions by date (YYYY-MM-DD)
  const activity = useMemo(() => {
    const counts: Record<string, number> = {};
    submissions.forEach(sub => {
      const date = new Date(sub.createdAt).toISOString().split('T')[0];
      counts[date] = (counts[date] || 0) + 1;
    });
    return counts;
  }, [submissions]);

  const days = 100;
  const today = new Date();
  
  // Create an array of the last `days` days
  const grid = useMemo(() => {
    const arr = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      arr.push({ date: dateStr, count: activity[dateStr] || 0 });
    }
    return arr;
  }, [activity, days]);

  const getColor = (count: number) => {
    if (count === 0) return 'var(--bg-tertiary)';
    if (count <= 2) return 'var(--color-primary-light)';
    if (count <= 5) return 'var(--color-primary)';
    return 'var(--color-primary-dark)';
  };

  return (
    <div className="card" style={{ marginTop: '1.5rem', overflowX: 'auto' }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 600 }}>Activity Heatmap (Past 100 days)</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12px, 1fr))', gap: '4px', maxWidth: '100%' }}>
        {grid.map(day => (
          <div 
            key={day.date} 
            title={`${day.count} submissions on ${day.date}`}
            style={{
              width: '12px', 
              height: '12px', 
              backgroundColor: getColor(day.count),
              borderRadius: '2px',
              opacity: day.count > 0 ? 1 : 0.6
            }} 
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <span>Less</span>
        <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '2px' }} />
        <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--color-primary-light)', borderRadius: '2px' }} />
        <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--color-primary)', borderRadius: '2px' }} />
        <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--color-primary-dark)', borderRadius: '2px' }} />
        <span>More</span>
      </div>
    </div>
  );
}
