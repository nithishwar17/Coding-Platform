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
    throw new Error('Judge0 API URL or API Key is missing in .env');
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
