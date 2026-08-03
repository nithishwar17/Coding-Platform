"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function ProblemsClient({ problems, dailyChallengeId }: { problems: any[], dailyChallengeId?: number }) {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
      const matchDifficulty = difficulty ? p.difficulty.toLowerCase() === difficulty.toLowerCase() : true;
      const matchStatus = statusFilter ? p.status === statusFilter : true;
      const matchTag = tagFilter ? p.tags.toLowerCase().includes(tagFilter.toLowerCase()) : true;
      
      return matchSearch && matchDifficulty && matchStatus && matchTag;
    });
  }, [problems, search, difficulty, statusFilter, tagFilter]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    problems.forEach(p => {
      p.tags.split(',').filter(Boolean).forEach((t: string) => tags.add(t.trim()));
    });
    return Array.from(tags).sort();
  }, [problems]);

  return (
    <div className={`container ${styles.problemsPage}`}>
      <div className={styles.header}>
        <h1>Problem Library</h1>
        <p className="text-secondary">Master algorithms across {'>'}5000 challenges.</p>
        
        <div className={styles.filters}>
          <input 
            type="text" 
            placeholder="Search problems..." 
            className={styles.searchInput} 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select 
            className={styles.filterSelect}
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <select 
            className={styles.filterSelect}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="todo">Todo</option>
            <option value="solved">Solved</option>
            <option value="attempted">Attempted</option>
          </select>
          <select 
            className={styles.filterSelect}
            value={tagFilter}
            onChange={e => setTagFilter(e.target.value)}
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
        <table className={styles.problemsTable}>
          <thead>
            <tr>
              <th style={{ width: '60px', textAlign: 'center' }}>Status</th>
              <th>Title</th>
              <th style={{ width: '120px' }}>Difficulty</th>
              <th>Tags</th>
            </tr>
          </thead>
          <tbody>
            {filteredProblems.length > 0 ? (
              filteredProblems.map(problem => {
                const tagList = problem.tags.split(',').filter(Boolean);
                
                return (
                  <tr key={problem.id}>
                    <td style={{ textAlign: 'center' }}>
                      <div className={`${styles.statusIcon} ${styles[problem.status]}`} title={problem.status}>
                        {problem.status === 'solved' ? '✓' : problem.status === 'attempted' ? '⚠' : ''}
                      </div>
                    </td>
                    <td>
                      <Link href={`/playground?id=${problem.id}`} className={styles.problemLink}>
                        {problem.title} {problem.id === dailyChallengeId && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--color-primary)', background: 'var(--bg-tertiary)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>🔥 Daily</span>}
                      </Link>
                    </td>
                    <td>
                      <span className={`${styles.difficulty} ${styles[problem.difficulty.toLowerCase()]}`}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td>
                      <div className={styles.tagList}>
                        {tagList.map((tag: string) => (
                          <span key={tag} className={styles.tag}>{tag}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                  No problems match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
