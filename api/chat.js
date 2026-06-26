export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message, system, messages } = req.body || {};
    
    const userMessages = messages || [{ role: 'user', content: message || 'Hello' }];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: system || 'You are GuideAI, a helpful education and career guidance assistant.',
        messages: userMessages
      })
    });

    const data = await response.json();
    console.log('Anthropic response:', JSON.stringify(data));
    
    if (data.error) return res.status(500).json({ error: data.error.message });
    if (!data.content || !data.content[0]) return res.status(500).json({ error: 'No response from AI' });
    
    res.status(200).json({ reply: data.content[0].text });
  } catch (err) {
    console.error('Handler error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
