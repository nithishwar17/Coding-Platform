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

        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: prompt,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.7,
            }
          });
          return NextResponse.json({ response: response.text });
        } catch (innerError: any) {
          if (innerError.status === 503) {
            console.log("gemini-3.5-flash is unavailable, falling back to gemini-3.5-flash-lite...");
            const fallbackResponse = await ai.models.generateContent({
              model: 'gemini-3.5-flash-lite',
              contents: prompt,
              config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
              }
            });
            return NextResponse.json({ response: fallbackResponse.text });
          }
          throw innerError;
        }

  } catch (error: any) {
    console.error("Mentor API Error:", error);
    
    let errorMessage = "Sorry, I ran into an error processing that request.";
    if (error?.status === 400 && error?.message?.includes("API key not valid")) {
      errorMessage = "The GEMINI_API_KEY you provided is invalid. Please double check it in your .env.local file!";
    } else if (error?.status === 404) {
      errorMessage = "Model not found. This API key doesn't seem to have access to the requested Gemini model.";
    } else if (error?.message) {
      errorMessage = "AI Mentor Error: " + error.message;
    }
    
    return NextResponse.json({ response: errorMessage });
  }
}
