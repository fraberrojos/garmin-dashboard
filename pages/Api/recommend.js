export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { stats } = req.body;
  const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const prompt = `Eres un entrenador personal experto. Analiza estos datos y recomienda un entrenamiento.

DATOS:
- Pasos: ${stats.steps} / ${stats.stepsGoal}
- Calorías activas: ${stats.activeCalories} kcal
- FC reposo: ${stats.restingHeartRate} bpm
- FC máxima: ${stats.maxHeartRate} bpm
- Sueño: ${(stats.totalSleep / 60).toFixed(1)} horas
- VO2: ${stats.vo2Max} ml/kg/min
- Estrés: ${stats.avgStress} / 100
- Tiempo activo: ${stats.activeTime} minutos
- Distancia: ${stats.distance} km

PERFIL: Principiante, interesado en ciclismo (prioritario), correr y fuerza.

Recomienda un entrenamiento específico basado en estos datos. Incluye tipo, duración e intensidad. Máximo 150 palabras.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'API error' });
    }

    return res.status(200).json({
      recommendation: data.content[0]?.text || 'No response',
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
