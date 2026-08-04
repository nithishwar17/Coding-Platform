export const JUDGE0_LANGUAGE_MAP: Record<string, number> = {
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
  javascript: 63,
  typescript: 74,
  go: 60,
  rust: 73,
  kotlin: 78
};

export async function submitToJudge0(sourceCode: string, languageId: number, stdin?: string) {
  const url = process.env.JUDGE0_API_URL;
  const key = process.env.JUDGE0_API_KEY;

  if (!url || !key) {
    // Mock the Judge0 response for testing UI when API key is missing
    console.warn("Judge0 API key missing. Returning mocked execution result.");
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if the user is returning the correct answer for "Best Time to Buy and Sell Stock" (5)
    // or something simple. We will just return a generic Accepted response.
    const isError = sourceCode.includes('Exception') || sourceCode.includes('error');
    
    if (isError) {
      return {
        status: { id: 11, description: 'Runtime Error (NZEC)' },
        compile_output: null,
        stdout: null,
        stderr: 'Exception in thread "main" java.lang.RuntimeException: Mocked Error',
        time: "0.015",
        memory: 1204
      };
    }

    return {
      status: { id: 3, description: 'Accepted' },
      compile_output: null,
      stdout: "5\n", // Mocked output
      stderr: null,
      time: "0.024",
      memory: 2048
    };
  }

  const response = await fetch(`${url}/submissions?base64_encoded=false&wait=true`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Host': new URL(url).host,
      'X-RapidAPI-Key': key
    },
    body: JSON.stringify({
      source_code: sourceCode,
      language_id: languageId,
      stdin: stdin || ""
    })
  });

  if (!response.ok) {
    throw new Error(`Judge0 API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}
