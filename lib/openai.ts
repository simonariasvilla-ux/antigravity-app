// Integración con OpenAI GPT-4o (structured outputs / JSON Schema)
// Extrae datos de negocios y calcula score de oportunidad

import OpenAI from 'openai';
import type { OpenAIProspectResponse, SearchParams } from '@/types/prospect';

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Clave de OpenAI no configurada. Ve a /configuracion y añade tu OPENAI_API_KEY.'
    );
  }
  return new OpenAI({ apiKey });
}

// JSON Schema para la respuesta estructurada
const prospectSchema = {
  type: 'object',
  properties: {
    prospectos: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          nombre: { type: ['string', 'null'] },
          telefono: { type: ['string', 'null'] },
          direccion: { type: ['string', 'null'] },
          sitio_web: { type: ['string', 'null'] },
          correo: { type: ['string', 'null'] },
          redes_sociales: {
            type: ['object', 'null'],
            properties: {
              facebook: { type: ['string', 'null'] },
              instagram: { type: ['string', 'null'] },
              twitter: { type: ['string', 'null'] },
              linkedin: { type: ['string', 'null'] },
              tiktok: { type: ['string', 'null'] },
              youtube: { type: ['string', 'null'] },
            },
            additionalProperties: false,
          },
          categoria: { type: ['string', 'null'] },
          score: {
            type: ['integer', 'null'],
            minimum: 0,
            maximum: 100,
          },
          razon_score: { type: ['string', 'null'] },
        },
        required: [
          'nombre', 'telefono', 'direccion', 'sitio_web',
          'correo', 'redes_sociales', 'categoria', 'score', 'razon_score',
        ],
        additionalProperties: false,
      },
    },
  },
  required: ['prospectos'],
  additionalProperties: false,
};

export async function extractProspects(
  rawData: string,
  params: SearchParams
): Promise<OpenAIProspectResponse> {
  const client = getClient();

  const systemPrompt = `Eres un asistente especializado en identificar oportunidades de negocio para una agencia de diseño web.
Tu tarea es extraer información de negocios y calcular un "score de oportunidad" (0-100).

Criterios de puntuación:
- Sin sitio web: +40 puntos (alta oportunidad)
- Sin presencia en redes sociales: +15 puntos
- Negocio local (restaurante, peluquería, taller, clínica): +10 puntos
- Rating Google bajo (<4.0): +10 puntos

RESPONDE ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "prospectos": [
    {
      "nombre": "string o null",
      "telefono": "string o null",
      "direccion": "string o null",
      "sitio_web": "string o null",
      "correo": null,
      "redes_sociales": null,
      "categoria": "string o null",
      "score": número entre 0-100,
      "razon_score": "string explicando el score"
    }
  ]
}

Lo que no aparezca en los datos ponlo como null. NO inventes información.`;

  const userPrompt = `Extrae y analiza estos negocios de ${params.categoria} en ${params.ciudad}, ${params.pais}:

${rawData}`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI no devolvió contenido. Verifica tu clave de API y cuota disponible.');
  }

  try {
    const parsed = JSON.parse(content) as OpenAIProspectResponse;
    if (!parsed.prospectos || !Array.isArray(parsed.prospectos)) {
      throw new Error('Formato de respuesta inesperado');
    }
    return parsed;
  } catch {
    throw new Error('Error al parsear la respuesta de OpenAI. Intenta de nuevo.');
  }
}

// Análisis de un solo negocio (para WhatsApp agent)
export async function analyzeProspect(businessData: Record<string, unknown>): Promise<string> {
  const client = getClient();

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Eres un asistente de ventas para una agencia web. Analiza este negocio y proporciona:
1. Un resumen breve (2-3 líneas)
2. Por qué necesitaría servicios web
3. Score de oportunidad estimado (0-100)
Responde en español, de forma concisa y profesional.`,
      },
      {
        role: 'user',
        content: `Analiza este negocio: ${JSON.stringify(businessData)}`,
      },
    ],
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content ?? 'No se pudo analizar el negocio.';
}
