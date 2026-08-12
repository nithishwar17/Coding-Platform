import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { problemTitle, code, prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        response: "The platform's AI Mentor requires a `GEMINI_API_KEY` in the `.env` file to function. Please configure this key to unlock real-time code analysis and hints!"
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const systemInstruction = `You are an expert AI coding mentor integrated into a competitive programming platform (like LeetCode).
Your job is to help the user with the problem: "${problemTitle || 'Unknown'}".
The user's current code is:
\`\`\`
${code || '(No code provided)'}
\`\`\`
RULES:
1. Do NOT write out the full solution for them.
2. Be encouraging, concise, and pedagogical.
3. If they ask for a hint, give them a subtle clue about the optimal data structure or algorithm.
4. If they ask about time complexity, analyze their provided code and explain the Big O notation simply.
5. Format your response cleanly using Markdown.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
        }
    });

    return NextResponse.json({ response: response.text });

  } catch (error) {
    console.error("Mentor API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
