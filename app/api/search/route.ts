import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { searchPlaces, getMockPlaces } from '@/lib/places';
import { extractProspects } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar sesión
    await requireAuth();

    // 2. Parsear body
    const body = await request.json();
    const { pais, ciudad, categoria, cantidad = 10, useMock = false } = body;

    if (!ciudad || !pais || !categoria) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos (pais, ciudad, categoria)' },
        { status: 400 }
      );
    }

    let rawText = '';
    
    // 3. Obtener datos de Google Places (o Mock)
    if (useMock) {
      const mockData = getMockPlaces(categoria, ciudad, cantidad);
      rawText = mockData.rawText;
      
      // Simular delay de red
      await new Promise(r => setTimeout(r, 1500));
    } else {
      const placesData = await searchPlaces(categoria, ciudad, pais, cantidad);
      rawText = placesData.rawText;
      
      if (placesData.results.length === 0) {
        return NextResponse.json({ prospects: [], message: 'No se encontraron resultados.' });
      }
    }

    // 4. Analizar con OpenAI (o Mock)
    if (useMock) {
      // Mock OpenAI response
      const mockProspects = Array.from({ length: cantidad }).map((_, i) => ({
        nombre: `${categoria} Ejemplo ${i + 1}`,
        telefono: `+123456789${i}`,
        direccion: `Calle Falsa ${123 + i}, ${ciudad}`,
        sitio_web: i % 2 === 0 ? `https://ejemplo${i}.com` : null,
        correo: `contacto@ejemplo${i}.com`,
        redes_sociales: { facebook: `fb.com/ejemplo${i}` },
        categoria: categoria,
        score: i % 2 === 0 ? 45 : 85,
        razon_score: 'Análisis de prueba',
      }));
      return NextResponse.json({ prospects: mockProspects });
    } else {
      try {
        const aiResponse = await extractProspects(rawText, { pais, ciudad, categoria, cantidad });
        return NextResponse.json({ prospects: aiResponse.prospectos });
      } catch (aiError) {
         console.error('Error OpenAI:', aiError);
         return NextResponse.json(
          { error: 'Error al procesar los datos con IA. Verifica tu OPENAI_API_KEY.' },
          { status: 500 }
        );
      }
    }

  } catch (error) {
    console.error('Error en /api/search:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
