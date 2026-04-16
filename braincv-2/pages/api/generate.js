// pages/api/generate.js
// Generates the full resume JSON from brainstorm answers

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, targetRole, answers, questions } = req.body;
  if (!name || !answers?.length) return res.status(400).json({ error: 'Missing fields' });

  const conversationSummary = answers.map((a, i) =>
    `Q: ${questions[i] || `Question ${i + 1}`}\nA: ${a}`
  ).join('\n\n');

  const prompt = `You are an expert resume writer. Based on the following user interview, create a professional, ATS-optimised resume.

Candidate Name: ${name}
Target Role: ${targetRole}

Interview:
${conversationSummary}

Generate the resume as a JSON object with EXACTLY this structure (return ONLY valid JSON, no markdown, no extra text):
{
  "summary": "2-3 sentence professional summary. Use strong action verbs. Mention the target role.",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "date": "Month Year – Month Year or duration",
      "bullets": [
        "Achievement bullet 1 — quantify with numbers where possible",
        "Achievement bullet 2",
        "Achievement bullet 3"
      ]
    }
  ],
  "skills": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6", "skill7", "skill8"],
  "education": "Degree — Institution, City (Year) or 'High school diploma — School Name (Year)'"
}

Guidelines:
- Use strong action verbs (Led, Built, Increased, Managed, Delivered, Reduced, etc.)
- Quantify achievements wherever possible (%, numbers, timeframes)
- Keep bullets concise and impactful (one line each)
- Make the summary confident and specific to ${targetRole}
- If information is vague, write the best professional version possible
- Skills should be relevant to ${targetRole}`;

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
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic generate error:', err);
      return res.status(500).json({ error: 'AI generation failed' });
    }

    const data = await response.json();
    const raw = data.content?.find(b => b.type === 'text')?.text || '{}';
    const clean = raw.replace(/```json\n?|```\n?/g, '').trim();
    const resume = JSON.parse(clean);

    return res.status(200).json({ resume });
  } catch (err) {
    console.error('Generate API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
