// Google Places API integration
// Busca negocios por ciudad, categoría y país

export interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  rating?: number;
  types?: string[];
  opening_hours?: { open_now: boolean };
  editorial_summary?: { overview: string };
}

export interface PlacesSearchResult {
  results: PlaceResult[];
  rawText: string; // Para pasar a OpenAI
  status: string;
}

const PLACES_NEW_URL = 'https://places.googleapis.com/v1/places';

function getApiKey(): string {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    throw new Error(
      'Clave de Google Places no configurada. Ve a /configuracion y añade tu GOOGLE_PLACES_API_KEY.'
    );
  }
  return key;
}

export async function searchPlaces(
  categoria: string,
  ciudad: string,
  pais: string,
  cantidad: number = 10
): Promise<PlacesSearchResult> {
  const apiKey = getApiKey();

  // Places API (New) - Text Search
  const searchRes = await fetch(`${PLACES_NEW_URL}:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': [
        'places.id',
        'places.displayName',
        'places.formattedAddress',
        'places.nationalPhoneNumber',
        'places.internationalPhoneNumber',
        'places.websiteUri',
        'places.rating',
        'places.types',
      ].join(','),
    },
    body: JSON.stringify({
      textQuery: `${categoria} en ${ciudad}, ${pais}`,
      languageCode: 'es',
      maxResultCount: Math.min(cantidad, 20),
    }),
  });

  if (!searchRes.ok) {
    const errBody = await searchRes.text();
    throw new Error(
      `Error al conectar con Google Places (${searchRes.status}): ${errBody}. Verifica tu clave de API.`
    );
  }

  const searchData = await searchRes.json();

  if (searchData.error) {
    const code = searchData.error.status || searchData.error.code;
    const msg = searchData.error.message || 'Error desconocido';
    if (code === 'PERMISSION_DENIED' || searchData.error.code === 403) {
      throw new Error(
        `Google Places rechazó la solicitud: "${msg}". ` +
        `Asegúrate de que la clave tenga "Places API (New)" habilitada en Google Cloud Console.`
      );
    }
    throw new Error(`Google Places devolvió error: ${msg}`);
  }

  const places = (searchData.places || []) as any[];

  if (places.length === 0) {
    return { results: [], rawText: 'Sin resultados para esta búsqueda.', status: 'ZERO_RESULTS' };
  }

  // Mapear al formato interno
  const detailedPlaces: PlaceResult[] = places.map((p: any) => ({
    place_id: p.id || '',
    name: p.displayName?.text || p.displayName || '',
    formatted_address: p.formattedAddress,
    formatted_phone_number: p.nationalPhoneNumber,
    international_phone_number: p.internationalPhoneNumber,
    website: p.websiteUri,
    rating: p.rating,
    types: p.types,
  }));

  // Construir texto raw para OpenAI
  const rawText = detailedPlaces
    .map((p, idx) => {
      const lines = [
        `[Negocio ${idx + 1}]`,
        `Nombre: ${p.name}`,
        `Dirección: ${p.formatted_address ?? 'No disponible'}`,
        `Teléfono: ${p.formatted_phone_number ?? p.international_phone_number ?? 'No disponible'}`,
        `Sitio web: ${p.website ?? 'Sin sitio web'}`,
        `Rating: ${p.rating ?? 'Sin rating'}/5`,
        `Tipos: ${(p.types ?? []).join(', ')}`,
      ];
      return lines.join('\n');
    })
    .join('\n\n');

  return {
    results: detailedPlaces,
    rawText,
    status: 'OK',
  };
}

// Mock para desarrollo sin API key
export function getMockPlaces(categoria: string, ciudad: string, cantidad: number): PlacesSearchResult {
  const mocks = Array.from({ length: cantidad }, (_, i) => ({
    place_id: `mock_${i}`,
    name: `${categoria} ${i + 1} en ${ciudad}`,
    formatted_address: `Calle Principal ${100 + i}, ${ciudad}`,
    formatted_phone_number: `+34 6${String(Math.floor(Math.random() * 90000000 + 10000000))}`,
    website: i % 3 === 0 ? `https://negocio${i + 1}.com` : undefined,
    rating: parseFloat((3 + Math.random() * 2).toFixed(1)),
    types: [categoria.toLowerCase().replace(/\s/g, '_')],
  }));

  const rawText = mocks
    .map((p, idx) => [
      `[Negocio ${idx + 1}]`,
      `Nombre: ${p.name}`,
      `Dirección: ${p.formatted_address}`,
      `Teléfono: ${p.formatted_phone_number}`,
      `Sitio web: ${p.website ?? 'Sin sitio web'}`,
      `Rating: ${p.rating}/5`,
    ].join('\n'))
    .join('\n\n');

  return { results: mocks, rawText, status: 'OK_MOCK' };
}
