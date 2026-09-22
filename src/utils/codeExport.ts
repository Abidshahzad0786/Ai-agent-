export function exportCodeSnippets(
  model: string,
  temp: number,
  maxTokens: number,
  sysPrompt: string,
  userPrompt: string,
  lang: string
): string {
  const shortSys = sysPrompt ? sysPrompt.slice(0, 50).replace(/\n/g, ' ') + '...' : 'System prompt';
  const shortUser = userPrompt ? userPrompt.slice(0, 50).replace(/\n/g, ' ') + '...' : 'User input';

  switch (lang) {
    case 'Python':
      return `import requests

headers = {"Authorization": "Bearer YOUR_API_KEY", "Content-Type": "application/json"}
payload = {
    "model": "${model}",
    "messages": [
        {"role": "system", "content": "${shortSys}"},
        {"role": "user", "content": "${shortUser}"}
    ],
    "temperature": ${temp},
    "max_tokens": ${maxTokens}
}
res = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
print(res.json()["choices"][0]["message"]["content"])`;

    case 'JavaScript (Node.js)':
      return `const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: { "Authorization": "Bearer YOUR_KEY", "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "${model}",
    messages: [
      { role: "system", content: "${shortSys}" },
      { role: "user", content: "${shortUser}" }
    ],
    temperature: ${temp},
    max_tokens: ${maxTokens}
  })
});
const data = await res.json();
console.log(data.choices[0].message.content);`;

    case 'cURL':
      return `curl https://api.groq.com/openai/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${model}",
    "messages": [
      {"role": "system", "content": "${shortSys}"},
      {"role": "user", "content": "${shortUser}"}
    ],
    "temperature": ${temp},
    "max_tokens": ${maxTokens}
  }'`;

    case 'Swift':
      return `var request = URLRequest(url: URL(string: "https://api.groq.com/openai/v1/chat/completions")!)
request.httpMethod = "POST"
request.addValue("Bearer YOUR_KEY", forHTTPHeaderField: "Authorization")
request.addValue("application/json", forHTTPHeaderField: "Content-Type")
let body: [String: Any] = [
    "model": "${model}",
    "temperature": ${temp},
    "max_tokens": ${maxTokens}
]
request.httpBody = try? JSONSerialization.data(withJSONObject: body)`;

    case 'Kotlin (Android)':
      return `val client = OkHttpClient()
val mediaType = "application/json".toMediaTypeOrNull()
val jsonBody = """
{
  "model": "${model}",
  "temperature": ${temp},
  "max_tokens": ${maxTokens}
}
""".trimIndent()
val body = RequestBody.create(mediaType, jsonBody)
val request = Request.Builder()
  .url("https://api.groq.com/openai/v1/chat/completions")
  .addHeader("Authorization", "Bearer YOUR_KEY")
  .post(body)
  .build()`;

    default:
      return '// Snippet ready.';
  }
}
