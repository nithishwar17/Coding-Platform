"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function ProblemsClient({ problems, dailyChallengeId }: { problems: any[], dailyChallengeId?: number }) {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const filteredProblems = useMemo(() => {
    setCurrentPage(1); // Reset page on filter change
    return problems.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
      const matchDifficulty = difficulty ? p.difficulty.toLowerCase() === difficulty.toLowerCase() : true;
      const matchStatus = statusFilter ? p.status === statusFilter : true;
      const matchTag = tagFilter ? p.tags.toLowerCase().includes(tagFilter.toLowerCase()) : true;
      
      return matchSearch && matchDifficulty && matchStatus && matchTag;
    });
  }, [problems, search, difficulty, statusFilter, tagFilter]);

  const totalPages = Math.ceil(filteredProblems.length / itemsPerPage);
  const paginatedProblems = filteredProblems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalSolved = useMemo(() => problems.filter(p => p.status === 'solved').length, [problems]);
  const progressPercent = problems.length > 0 ? (totalSolved / problems.length) * 100 : 0;

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

      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem 1.5rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <span style={{ fontWeight: 500 }}>Overall Progress</span>
            <span style={{ color: 'var(--text-secondary)' }}>{totalSolved} / {problems.length} Solved</span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: 'var(--success)', transition: 'width 0.5s ease-in-out' }} />
          </div>
        </div>
        <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--success)' }}>
          {progressPercent.toFixed(1)}%
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
            {paginatedProblems.length > 0 ? (
              paginatedProblems.map(problem => {
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

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
          <button 
            className="btn btn-secondary" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button 
            className="btn btn-secondary" 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
