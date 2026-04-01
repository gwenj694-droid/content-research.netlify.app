exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
  try {
    const { niche, audience, goal, platforms, context } = JSON.parse(event.body);
    const key = process.env.OPENAI_API_KEY;

    const prompt = `You are a social media marketing expert specialising in TikTok Shop, Instagram Reels and Facebook Ads.

Research and identify the TOP 3 winning content formulas for this niche right now:

Niche/Product: ${niche}
Target Audience: ${audience || 'General audience'}
Content Goal: ${goal || 'Drive direct sales'}
Platforms: ${platforms || 'TikTok Shop, Instagram Reels, Facebook Ads'}
Additional Context: ${context || 'none'}

For each winning formula provide:
1. A catchy name for the content formula
2. Why it works (2-3 sentences)
3. A detailed image/video prompt to recreate it
4. The platform it works best on

Format your response as JSON with this exact structure:
{
  "formulas": [
    {
      "name": "Formula name",
      "platform": "Platform name",
      "score": "Trending Now / High Engagement / High ROAS",
      "why": "Why this works...",
      "prompt": "Detailed image prompt..."
    }
  ]
}

Return ONLY valid JSON, no other text.`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 1200 })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'OpenAI error');
    const raw = data.choices[0].message.content.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(raw);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(parsed)
    };
  } catch(err) {
    return { statusCode: 500, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: err.message }) };
  }
};
