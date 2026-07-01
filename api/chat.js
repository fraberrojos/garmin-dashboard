export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, stats } = req.body;
  const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const prompt = `Eres un entrenador personal y asesor de salud experto. El usuario te hace una pregunta basada en sus datos de bienestar actual.

DATOS ACTUALES DEL USUARIO:
- Pasos hoy: ${stats.steps} / ${stats.stepsGoal}
- Calorías activas: ${stats.activeCalories} kcal
- Frecuencia cardíaca en reposo: ${stats.restingHeartRate} bpm
- FC máxima hoy: ${stats.maxHeartRate} bpm
- Sueño anoche: ${(stats.totalSleep / 60).toFixed(1)} horas
- Sueño profundo: ${(stats.deepSleep / 60).toFixed(1)} h
- VO2 Máximo: ${stats.vo2Max} ml/kg/min
- Nivel de estrés: ${stats.avgStress} / 100
- Tiempo activo hoy: ${stats.activeTime} minutos
- Distancia hoy: ${stats.distance} km

PERFIL DEL USUARIO:
- Principiante
- Interesado en: ciclismo (prioritario), correr, entrenamiento de fuerza
- Hora actual: ${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, '0')}

PREGUNTA DEL USUARIO:
"${question}"

Responde de forma personalizada y práctica basándote en sus datos reales. Sé conciso (máximo 200 palabras). Incluye referencias específicas a sus métricas cuando sea relevante.`;

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
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'API error' });
    }

    return res.status(200).json({
      answer: data.content[0]?.text || 'No answer available',
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
