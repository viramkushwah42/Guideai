export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, language } = req.body;

  const systemPrompt = `You are GuideAI, an education and career guidance assistant. 
Reply in ${language === 'hi' ? 'Hindi' : language === 'ar' ? 'Arabic' : language === 'es' ? 'Spanish' : 'English'}.
Help students with courses, careers, scholarships, and government jobs.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: message }] }]
        })
      }
    );

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) throw new Error('No response from Gemini');

    res.status(200).json({ response: reply });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
