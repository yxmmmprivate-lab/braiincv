// pages/api/chat.js
// Called during brainstorm chat to get an AI acknowledgment + next question

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { currentQuestion, userAnswer, nextQuestion } = req.body;
  if (!userAnswer || !nextQuestion) return res.status(400).json({ error: 'Missing fields' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `You are a warm, friendly resume brainstorming assistant helping someone build their resume.

Your question was: "${currentQuestion}"
Their answer: "${userAnswer}"

Write a brief, encouraging 1-2 sentence response that acknowledges what they shared (be specific to their answer). Then naturally lead into asking: "${nextQuestion}"

Rules:
- Keep it under 60 words total
- Conversational and warm, not formal
- No bullet points
- Do NOT say "Great answer!" — be more specific
- Do NOT repeat the next question verbatim if it's long, rephrase it naturally`,
        }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic error:', err);
      return res.status(200).json({ text: nextQuestion }); // fallback gracefully
    }

    const data = await response.json();
    const text = data.content?.find(b => b.type === 'text')?.text || nextQuestion;
    return res.status(200).json({ text });
  } catch (err) {
    console.error('Chat API error:', err);
    return res.status(200).json({ text: nextQuestion }); // never crash the UX
  }
}
