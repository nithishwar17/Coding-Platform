import { NextResponse } from 'next/server';
import { submitToJudge0, JUDGE0_LANGUAGE_MAP } from '../../../lib/judge0';
import { getTestHarness } from '../../../lib/testHarness';

export async function POST(request: Request) {
  try {
    const { language, sourceCode, stdin } = await request.json();

    if (!language || !sourceCode) {
      return NextResponse.json({ error: 'Language and sourceCode are required' }, { status: 400 });
    }

    const languageId = JUDGE0_LANGUAGE_MAP[language];
    if (!languageId) {
      return NextResponse.json({ error: `Unsupported language: ${language}` }, { status: 400 });
    }

    const executableCode = getTestHarness(language, sourceCode);

    const data = await submitToJudge0(executableCode, languageId, stdin);
    
    // Normalize response for the frontend
    return NextResponse.json({
      stdout: data.stdout || "",
      stderr: data.stderr || "",
      compile_output: data.compile_output || "",
      status: data.status?.description || "Unknown",
      time: parseFloat(data.time) * 1000 || 0, // convert to ms
      memory: data.memory || 0 // in KB
    });

  } catch (error: any) {
    console.error('Error executing code:', error);
    return NextResponse.json({ error: error.message || 'Failed to execute code' }, { status: 500 });
  }
}
