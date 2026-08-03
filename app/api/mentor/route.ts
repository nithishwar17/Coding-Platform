import { NextResponse } from 'next/server';

// TODO: To connect to a real AI, import your SDK here:
// import { GoogleGenerativeAI } from "@google/genai";
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req: Request) {
  try {
    const { problemTitle, code, prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // Simulated network delay for AI "thinking" (1.5 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    let simulatedResponse = "";
    
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes("hint")) {
      simulatedResponse = `Here's a hint for **${problemTitle || 'this problem'}**: Try breaking down the problem into smaller sub-problems. Have you considered using a hash map or two pointers to optimize your search?`;
    } else if (lowerPrompt.includes("time complexity")) {
      simulatedResponse = `Looking at your code, if you are using nested loops to iterate over the array, the time complexity is likely **O(N²)**. To optimize this, try aiming for **O(N)** time by doing a single pass and storing seen elements.`;
    } else if (lowerPrompt.includes("analyze")) {
      simulatedResponse = `I've analyzed your code. It looks like you have a good grasp of the basic logic! However, be careful with edge cases—what happens if the input array is empty or contains negative numbers? Consider adding an early return for those cases.`;
    } else {
      simulatedResponse = `This is a simulated AI Mentor response to your custom question: "${prompt}".\n\n*(In a production environment with a real API key configured, this would evaluate your code: \n\`\`\`\n${code?.substring(0, 50)}...\n\`\`\`\nand give a genuine response!)*`;
    }

    // TODO: Real Implementation Example:
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
    // const result = await model.generateContent(`Problem: ${problemTitle}\nCode:\n${code}\nUser Prompt:\n${prompt}`);
    // return NextResponse.json({ response: result.response.text() });

    return NextResponse.json({ response: simulatedResponse });

  } catch (error) {
    console.error("Mentor API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
