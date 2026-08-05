import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { getTestHarness } from "../../../lib/testHarness";
import { submitToJudge0, JUDGE0_LANGUAGE_MAP } from '../../../lib/judge0';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { problemId, language, sourceCode } = await req.json();

    if (!problemId || !language || !sourceCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const languageId = JUDGE0_LANGUAGE_MAP[language];
    if (!languageId) {
      return NextResponse.json({ error: `Unsupported language: ${language}` }, { status: 400 });
    }

    const problem = await prisma.problem.findUnique({ 
      where: { id: Number(problemId) },
      include: { testCases: true }
    });
    
    if (!problem) return NextResponse.json({ error: "Problem not found" }, { status: 404 });

    const executableCode = getTestHarness(language, sourceCode);
    
    let passed = 0;
    const total = problem.testCases.length;
    let finalVerdict = 'Accepted';
    let maxRuntime = 0;
    let maxMemory = 0;
    let failedCase = null;
    let expectedOutput = null;
    let actualOutput = null;

    for (const tc of problem.testCases) {
      try {
        const data = await submitToJudge0(executableCode, languageId, tc.input);
        
        const runtime = parseFloat(data.time) * 1000 || 0;
        const memory = data.memory || 0;
        maxRuntime = Math.max(maxRuntime, runtime);
        maxMemory = Math.max(maxMemory, memory);

        if (data.status?.id !== 3) { // 3 is Accepted in Judge0
          finalVerdict = data.status?.description || 'Runtime Error';
          failedCase = tc.input;
          actualOutput = (data.compile_output || data.stderr || data.stdout || "").trim();
          expectedOutput = tc.expectedOutput.trim();
          break; // Stop on first failure
        }

        const outStr = (data.stdout || "").trim();
        const expStr = tc.expectedOutput.trim();

        // Remove all whitespace for robust comparison
        const normOut = outStr.replace(/\s+/g, '');
        const normExp = expStr.replace(/\s+/g, '');

        if (normOut === normExp) {
          passed++;
        } else {
          finalVerdict = 'Wrong Answer';
          failedCase = tc.input;
          actualOutput = outStr;
          expectedOutput = expStr;
          break; // Stop on first failure
        }
      } catch (err: any) {
        finalVerdict = 'Runtime Error';
        failedCase = tc.input;
        actualOutput = err.message;
        expectedOutput = tc.expectedOutput;
        break;
      }
    }

    // Create Submission record
    const submission = await prisma.submission.create({
      data: {
        code: sourceCode,
        language,
        status: finalVerdict,
        executionTime: maxRuntime,
        memoryKb: maxMemory,
        problemId: Number(problemId),
        userId: userId
      }
    });

    // Update User XP and Streak if Accepted
    if (finalVerdict === 'Accepted') {
      const userRecord = await prisma.user.findUnique({ where: { id: userId }, select: { lastActive: true, streak: true } });
      let newStreak = userRecord?.streak || 0;
      
      if (userRecord?.lastActive) {
        const today = new Date();
        const last = new Date(userRecord.lastActive);
        const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
        const lastUTC = Date.UTC(last.getFullYear(), last.getMonth(), last.getDate());
        
        const diffDays = Math.floor((todayUTC - lastUTC) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        } else if (diffDays === 0 && newStreak === 0) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      // Calculate XP Reward with Streak Bonuses
      let xpReward = 10; // Base XP for solving a problem
      if (newStreak > (userRecord?.streak || 0)) { // Only award bonus if streak actually increased today
        if (newStreak === 3) xpReward += 50; // 3-day streak bonus
        if (newStreak === 7) xpReward += 200; // 7-day streak bonus
        if (newStreak === 30) xpReward += 1000; // 30-day streak bonus
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: { increment: xpReward },
          streak: newStreak,
          lastActive: new Date()
        }
      });
    }

    return NextResponse.json({ 
      verdict: finalVerdict,
      passed,
      total,
      runtime: maxRuntime,
      memory: maxMemory,
      failedCase,
      expected: expectedOutput,
      actual: actualOutput,
      submissionId: submission.id
    });

  } catch (error: any) {
    console.error("Submission API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
