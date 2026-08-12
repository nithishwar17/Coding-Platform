export const JDOODLE_LANGUAGE_MAP: Record<string, { lang: string, versionIndex: string }> = {
  python: { lang: 'python3', versionIndex: '3' },
  java: { lang: 'java', versionIndex: '4' },
  cpp: { lang: 'cpp', versionIndex: '5' },
  c: { lang: 'c', versionIndex: '5' },
  javascript: { lang: 'nodejs', versionIndex: '4' },
  typescript: { lang: 'nodejs', versionIndex: '4' }, // fallback to nodejs
  go: { lang: 'go', versionIndex: '4' },
  rust: { lang: 'rust', versionIndex: '4' },
  kotlin: { lang: 'kotlin', versionIndex: '3' }
};

export async function submitToCompiler(sourceCode: string, language: string, stdin?: string) {
  const clientId = process.env.JDOODLE_CLIENT_ID;
  const clientSecret = process.env.JDOODLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("JDoodle credentials missing");
  }

  const langConfig = JDOODLE_LANGUAGE_MAP[language];
  if (!langConfig) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const response = await fetch("https://api.jdoodle.com/v1/execute", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      clientId: clientId,
      clientSecret: clientSecret,
      script: sourceCode,
      language: langConfig.lang,
      versionIndex: langConfig.versionIndex,
      stdin: stdin || ""
    })
  });

  if (!response.ok) {
    throw new Error(`JDoodle API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Normalize response to match our expected format
  // JDoodle returns { output, statusCode, memory, cpuTime, error }
  let statusDesc = 'Accepted';
  if (data.error) {
    statusDesc = 'Runtime Error';
  }

  return {
    status: { description: statusDesc },
    compile_output: data.error || null,
    stdout: data.output || "",
    stderr: data.error || "",
    time: data.cpuTime || "0",
    memory: data.memory || 0
  };
}
