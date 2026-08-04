"use client";

import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import styles from "./page.module.css";
import { useTheme } from "next-themes";
import { Problem } from "@prisma/client";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";

const CODE_TEMPLATES: Record<string, string> = {
  javascript: "function solution(nums, target) {\n  \n}",
  typescript: "function solution(nums: any, target: any) {\n  \n}",
  python: "def solution(*args):\n    pass",
  java: "class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello CodeNexus!\");\n    }\n}",
  cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Hello CodeNexus!\" << endl;\n    return 0;\n}",
  go: "package main\nimport \"fmt\"\n\nfunc main() {\n    fmt.Println(\"Hello CodeNexus!\")\n}",
  rust: "fn main() {\n    println!(\"Hello CodeNexus!\");\n}"
};

export default function PlaygroundClient({ problem }: { problem: any }) {
  let parsedStarterCode: Record<string, string> = {};
  try {
    if ((problem as any).starterCode) {
      parsedStarterCode = JSON.parse((problem as any).starterCode);
    }
  } catch(e) {}

  const [activeTab, setActiveTab] = useState("description");
  const [language, setLanguage] = useState("typescript");
  const [code, setCode] = useState(() => {
    return parsedStarterCode["typescript"] || CODE_TEMPLATES["typescript"];
  });
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    const currentTemplate = parsedStarterCode[language] || CODE_TEMPLATES[language] || "";
    
    if (code !== currentTemplate) {
      if (!window.confirm("You have modified the code. Are you sure you want to switch languages? Your changes will be lost.")) {
        return;
      }
    }

    setLanguage(newLang);
    setCode(parsedStarterCode[newLang] || CODE_TEMPLATES[newLang] || "");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === 'system' ? systemTheme : theme;
  const [editorThemeOverride, setEditorThemeOverride] = useState("");
  const editorTheme = editorThemeOverride || (currentTheme === 'dark' ? 'vs-dark' : 'light');

  const [output, setOutput] = useState<{ stdout?: string, stderr?: string, error?: string, status?: string, metrics?: {passed?: number, total?: number, timeMs?: number, memoryKb?: number, failedCase?: any, expected?: any} } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  
  // Test Case Viewer State
  const [activeOutputTab, setActiveOutputTab] = useState<'testcases' | 'results'>('testcases');
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(0);

  const [testCases, setTestCases] = useState<any[]>(() => {
    if (problem.testCases && Array.isArray(problem.testCases)) {
      return problem.testCases.map((tc: any) => ({
        input: tc.input,
        expected: tc.expectedOutput
      }));
    }
    return [];
  });
  
  // AI Mentor State
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [mentorInput, setMentorInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const handleMentorRequest = async (promptText: string) => {
    const userMsg = { role: 'user' as const, content: promptText };
    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const res = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          problemTitle: problem.title, 
          code: code, 
          prompt: promptText 
        }),
      });
      const data = await res.json();
      
      if (data.response) {
        setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I ran into an error processing that request." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: "Failed to connect to AI Mentor." }]);
    } finally {
      setIsThinking(false);
    }
  };

  // Submissions State
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  const fetchSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const res = await fetch(`/api/submissions?problemId=${problem.id}`);
      const data = await res.json();
      if (data.submissions) {
        setSubmissions(data.submissions);
      }
    } catch (err) {}
    setLoadingSubmissions(false);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);
    setActiveOutputTab('results');
    try {
      const tc = testCases[activeTestCaseIndex];
      const stdinStr = typeof tc?.input === 'object' ? JSON.stringify(tc.input) : String(tc?.input || "");

      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, sourceCode: code, stdin: stdinStr }),
      });
      const data = await res.json();
      if (data.error || data.message) {
        setOutput({ error: data.error || data.message });
      } else {
        setOutput({
          stdout: data.stdout,
          stderr: data.stderr || data.compile_output,
          status: data.status,
          metrics: {
             timeMs: data.time,
             memoryKb: data.memory
          },
        });
      }
    } catch (err) {
      setOutput({ error: "Failed to connect to execution server." });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setOutput(null);
    setActiveOutputTab('results');
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId: problem.id, language, sourceCode: code }),
      });
      const data = await res.json();
      if (data.error) {
        setOutput({ error: data.error });
      } else {
        setOutput({
          status: data.verdict,
          stdout: data.actual,
          metrics: {
            passed: data.passed,
            total: data.total,
            timeMs: data.runtime,
            memoryKb: data.memory,
            expected: data.expected,
            failedCase: data.failedCase
          }
        });
        if (data.verdict === 'Accepted') {
          alert("Submission Accepted! XP and Streak updated.");
        }
      }
    } catch (err) {
      setOutput({ error: "Failed to submit code." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.playground}>
      <PanelGroup orientation="horizontal" style={{ width: '100%', height: '100%' }}>
      {/* Left Pane: Problem Info */}
      <Panel defaultSize={45} minSize={20} className={styles.pane} style={{ display: 'flex', flexDirection: 'column' }}>
        <div className={styles.tabs}>
          <div 
            className={`${styles.tab} ${activeTab === 'description' ? styles.active : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Description
          </div>
          <div 
            className={`${styles.tab} ${activeTab === 'notes' ? styles.active : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            Notes
          </div>
          <div 
            className={`${styles.tab} ${activeTab === 'mentor' ? styles.active : ''}`}
            onClick={() => setActiveTab('mentor')}
          >
            AI Mentor
          </div>
          <div 
            className={`${styles.tab} ${activeTab === 'submissions' ? styles.active : ''}`}
            onClick={() => { setActiveTab('submissions'); fetchSubmissions(); setSelectedSubmission(null); }}
          >
            Submissions
          </div>
        </div>

        <div className={styles.contentArea}>
          {activeTab === 'description' && (
            <div>
              <h1 className={styles.problemTitle}>{problem.title}</h1>
              <div className={styles.problemMeta}>
                <span className={styles[problem.difficulty.toLowerCase()]} style={{ color: problem.difficulty === 'Easy' ? 'var(--success)' : problem.difficulty === 'Medium' ? 'var(--warning)' : 'var(--error)' }}>
                  {problem.difficulty}
                </span>
                <span>{problem.tags.split(',').join(', ')}</span>
              </div>
              <div 
                className={styles.problemDescription}
                dangerouslySetInnerHTML={{ __html: problem.description.replace(/\n/g, '<br/>').replace(/```text/g, '<pre>').replace(/```/g, '</pre>') }}
              />
            </div>
          )}
          {activeTab === 'notes' && (
            <div>
              <h2 style={{ marginBottom: '1rem' }}>My Notes</h2>
              <textarea 
                style={{ width: '100%', height: '300px', padding: '1rem', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                placeholder="Write your observations, edge cases, and formulas here..."
              />
              <button className="btn btn-primary" style={{ marginTop: '1rem' }}>Save Notes</button>
            </div>
          )}
          {activeTab === 'mentor' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', border: '1px solid var(--border-color)', borderBottom: 'none' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                  <span>🤖</span> AI Mentor
                </h3>
                <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Ask me for hints, complexity analysis, or code reviews!
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '0.4rem 0.8rem' }} onClick={() => handleMentorRequest("Give me a hint")} disabled={isThinking}>Give me a hint</button>
                  <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '0.4rem 0.8rem' }} onClick={() => handleMentorRequest("Explain Time Complexity")} disabled={isThinking}>Time Complexity</button>
                  <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '0.4rem 0.8rem' }} onClick={() => handleMentorRequest("Analyze my code")} disabled={isThinking}>Analyze Code</button>
                </div>
              </div>
              
              <div style={{ flex: 1, background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderTop: '1px solid var(--border-color)', borderBottom: 'none', padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', marginTop: '2rem' }}>
                    No messages yet. Send a prompt or use a quick action above to get started!
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.2rem', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                        {msg.role === 'user' ? 'You' : 'AI Mentor'}
                      </div>
                      <div style={{ 
                        background: msg.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-secondary)', 
                        color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                        padding: '0.75rem 1rem', 
                        borderRadius: msg.role === 'user' ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0',
                        lineHeight: 1.5,
                        fontSize: '0.95rem',
                        border: msg.role === 'user' ? 'none' : '1px solid var(--border-color)'
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                {isThinking && (
                  <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>AI Mentor</div>
                    <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem 1rem', borderRadius: '1rem 1rem 1rem 0', border: '1px solid var(--border-color)' }}>
                      <span className={styles.typingDot}>.</span><span className={styles.typingDot}>.</span><span className={styles.typingDot}>.</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '0 0 var(--radius-md) var(--radius-md)' }}>
                <form 
                  style={{ display: 'flex', gap: '0.5rem' }} 
                  onSubmit={(e) => { 
                    e.preventDefault(); 
                    if (mentorInput.trim()) {
                      handleMentorRequest(mentorInput);
                      setMentorInput('');
                    }
                  }}
                >
                  <input 
                    type="text" 
                    value={mentorInput}
                    onChange={(e) => setMentorInput(e.target.value)}
                    placeholder="Ask a custom question..." 
                    style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    disabled={isThinking}
                  />
                  <button type="submit" className="btn btn-primary" disabled={isThinking || !mentorInput.trim()}>Send</button>
                </form>
              </div>
            </div>
          )}
          {activeTab === 'submissions' && (
            <div>
              <h2 style={{ marginBottom: '1rem' }}>Submissions</h2>
              {loadingSubmissions ? (
                <div>Loading...</div>
              ) : selectedSubmission ? (
                <div>
                  <button className="btn btn-secondary" onClick={() => setSelectedSubmission(null)} style={{ marginBottom: '1rem' }}>&larr; Back</button>
                  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ color: selectedSubmission.status === 'Accepted' ? 'var(--success)' : 'var(--error)', fontWeight: 'bold' }}>{selectedSubmission.status}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{new Date(selectedSubmission.createdAt).toLocaleString()}</span>
                    </div>
                    <pre style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', overflowX: 'auto', fontFamily: 'var(--font-geist-mono)' }}>
                      {selectedSubmission.code}
                    </pre>
                  </div>
                </div>
              ) : submissions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {submissions.map((sub: any) => (
                    <div 
                      key={sub.id} 
                      onClick={() => setSelectedSubmission(sub)}
                      style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', border: '1px solid var(--border-color)' }}
                    >
                      <div>
                        <div style={{ color: sub.status === 'Accepted' ? 'var(--success)' : 'var(--error)', fontWeight: 'bold' }}>{sub.status}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{sub.language}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{new Date(sub.createdAt).toLocaleDateString()}</div>
                        {sub.executionTime && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{sub.executionTime} ms</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--text-secondary)' }}>No submissions yet.</div>
              )}
            </div>
          )}
        </div>
      </Panel>

      <PanelResizeHandle className={styles.resizeHandle} />

      {/* Right Pane: Code Editor and Output */}
      <Panel defaultSize={55} minSize={20} className={styles.pane} style={{ display: 'flex', flexDirection: 'column' }}>
        <PanelGroup orientation="vertical">
        <Panel defaultSize={60} minSize={20} style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid var(--border-color)' }}>
          <div className={styles.editorToolbar}>
            <select 
              className={styles.languageSelect}
              value={language}
              onChange={handleLanguageChange}
            >
              <option value="typescript">TypeScript</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
            </select>

            <div className={styles.actionButtons}>
              <button className="btn btn-secondary" onClick={() => setShowSettings(true)} style={{ padding: '0.4rem 0.6rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>⚙️</button>
              <button className="btn btn-secondary" onClick={handleRunCode} disabled={isRunning || isSubmitting}>
                {isRunning ? 'Running...' : 'Run'}
              </button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={isRunning || isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            {mounted && (
              <Editor
                height="100%"
                theme={editorTheme}
                language={language}
                value={code}
                onChange={(val) => setCode(val || "")}
                onMount={(editor) => setEditorInstance(editor)}
                options={{
                  minimap: { enabled: false },
                  fontSize: fontSize,
                  fontFamily: 'var(--font-geist-mono), monospace',
                  padding: { top: 16 },
                  scrollBeyondLastLine: false,
                }}
              />
            )}
          </div>
        </Panel>

        <PanelResizeHandle style={{ height: '8px', cursor: 'row-resize', background: 'var(--border-color)' }} />

        <Panel defaultSize={40} minSize={20} className={styles.outputPane} style={{ display: 'flex', flexDirection: 'column' }}>
          <div className={styles.outputTabs}>
            <div 
              className={`${styles.outputTab} ${activeOutputTab === 'testcases' ? styles.active : ''}`}
              onClick={() => setActiveOutputTab('testcases')}
            >
              Test Cases
            </div>
            <div 
              className={`${styles.outputTab} ${activeOutputTab === 'results' ? styles.active : ''}`}
              onClick={() => setActiveOutputTab('results')}
            >
              Test Results
            </div>
          </div>
          <div className={styles.outputContent}>
            {activeOutputTab === 'testcases' && (
              <div>
                {testCases.length > 0 ? (
                  <>
                    <div className={styles.testCaseSubTabs}>
                      {testCases.map((_, idx) => (
                        <div 
                          key={idx}
                          className={`${styles.testCaseSubTab} ${activeTestCaseIndex === idx ? styles.active : ''}`}
                          onClick={() => setActiveTestCaseIndex(idx)}
                        >
                          Case {idx + 1}
                        </div>
                      ))}
                      <div 
                        className={styles.testCaseSubTab}
                        onClick={() => {
                          const newTc = [...testCases];
                          newTc.push({ input: testCases[0]?.input || "", expected: "" });
                          setTestCases(newTc);
                          setActiveTestCaseIndex(newTc.length - 1);
                        }}
                      >
                        + Add
                      </div>
                    </div>
                    
                    <div className={styles.testCaseBlock}>
                      <div className={styles.testCaseLabel}>Input (Editable)</div>
                      <textarea
                        className={styles.testCaseValue}
                        style={{ fontFamily: 'var(--font-geist-mono)', whiteSpace: 'pre-wrap', width: '100%', minHeight: '60px' }}
                        value={typeof testCases[activeTestCaseIndex]?.input === 'object' && testCases[activeTestCaseIndex].input !== null 
                          ? Object.entries(testCases[activeTestCaseIndex].input).map(([k, v]) => `${k} = ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`).join('\n')
                          : String(testCases[activeTestCaseIndex]?.input || '')
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          const newTc = [...testCases];
                          
                          // Simple parse: "nums = [1,2]\ntarget = 3"
                          if (typeof newTc[activeTestCaseIndex].input === 'object' && newTc[activeTestCaseIndex].input !== null) {
                            const lines = val.split('\n');
                            const newInput: any = {};
                            lines.forEach(line => {
                              const parts = line.split('=');
                              if (parts.length >= 2) {
                                const k = parts[0].trim();
                                const vStr = parts.slice(1).join('=').trim();
                                try { newInput[k] = JSON.parse(vStr); } catch(err) { newInput[k] = vStr; }
                              }
                            });
                            newTc[activeTestCaseIndex].input = newInput;
                          } else {
                            newTc[activeTestCaseIndex].input = val;
                          }
                          setTestCases(newTc);
                        }}
                      />
                    </div>
                    <div className={styles.testCaseBlock}>
                      <div className={styles.testCaseLabel}>Expected Output</div>
                      <div className={styles.testCaseValue} style={{ fontFamily: 'var(--font-geist-mono)', whiteSpace: 'pre-wrap' }}>
                        {(() => {
                          const tc = testCases[activeTestCaseIndex];
                          if (!tc) return "";
                          const exp = tc.expected !== undefined ? tc.expected : tc.expectedOutput;
                          return typeof exp === 'object' ? JSON.stringify(exp) : String(exp);
                        })()}
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ color: 'var(--text-secondary)' }}>No test cases available for this problem.</div>
                )}
              </div>
            )}

            {activeOutputTab === 'results' && (
              <>
                {output ? (
                  <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-geist-mono)' }}>
                    {output.status && (
                      <div style={{ color: output.status === 'Accepted' ? 'var(--success)' : 'var(--error)', fontWeight: 'bold', marginBottom: '1rem', fontSize: '1.2rem' }}>
                        {output.status}
                      </div>
                    )}
                    
                    {output.metrics && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1rem', background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                        {output.metrics.total !== undefined && (
                          <div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Test Cases</div>
                            <div style={{ color: output.metrics.passed === output.metrics.total ? 'var(--success)' : 'var(--error)', fontWeight: 'bold' }}>
                              {output.metrics.passed} / {output.metrics.total} Passed
                            </div>
                          </div>
                        )}
                        <div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Runtime</div>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
                            {output.metrics.timeMs?.toFixed(2) || 0} ms
                          </div>
                        </div>
                        <div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Memory</div>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
                            {output.metrics.memoryKb || 0} KB
                          </div>
                        </div>
                        {output.metrics.failedCase && (
                          <div style={{ width: '100%' }}>
                             <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Failed Test Case Input</div>
                             <div style={{ background: 'var(--bg-tertiary)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>{output.metrics.failedCase}</div>
                             <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Expected</div>
                             <div style={{ background: 'var(--bg-tertiary)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>{output.metrics.expected}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {output.error && <div style={{ color: 'var(--error)' }}>{output.error}</div>}
                    {output.stderr && <div style={{ color: 'var(--error)' }}>{output.stderr}</div>}
                    
                    {output.stdout && (
                      <div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Console Output</div>
                        <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                          {output.stdout}
                        </div>
                      </div>
                    )}
                    
                    {!output.error && !output.stderr && !output.stdout && !output.metrics && <div style={{ color: 'var(--text-secondary)' }}>Program exited with no output.</div>}
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ padding: '0.5rem 1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: '1px solid var(--border-color)' }}>Console</div>
                    </div>
                    <div>
                      <p className="text-secondary" style={{ marginBottom: '0.5rem' }}>Ready to execute.</p>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </Panel>
        </PanelGroup>
      </Panel>
      </PanelGroup>

      {showSettings && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: 'var(--radius-md)', minWidth: '350px', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Editor Settings</h2>
            
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Font Size</label>
              <input type="number" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} style={{ width: '100%', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Editor Theme</label>
              <select value={editorThemeOverride} onChange={e => setEditorThemeOverride(e.target.value)} style={{ width: '100%', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                <option value="">System Default</option>
                <option value="vs-dark">VS Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
            
            <button className="btn btn-primary" onClick={() => setShowSettings(false)} style={{ width: '100%' }}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
