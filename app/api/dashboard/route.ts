import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { getProspectStatsLocal, initLocalDb } from '@/lib/sqlite';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    await initLocalDb();
    
    // Obtenemos estadísticas reales de SQLite
    const stats = getProspectStatsLocal();

    // Transformamos los datos para el frontend
    const totalProspectos = stats.total;
    const contactados = (stats.porEstado['contactado'] || 0) + (stats.porEstado['interesado'] || 0) + (stats.porEstado['convertido'] || 0) + (stats.porEstado['descartado'] || 0);
    const interesados = stats.porEstado['interesado'] || 0;
    const convertidos = stats.porEstado['convertido'] || 0;
    
    const kpis = {
      totalProspectos,
      contactados,
      interesados,
      convertidos,
      tasaConversion: totalProspectos > 0 ? (convertidos / totalProspectos) * 100 : 0,
      scorePromedio: stats.scorePromedio,
    };

    // Datos simulados para gráficas (en una app real agruparíamos por fecha/ciudad en SQLite)
    const monthlyData = [
      { mes: 'Ene', prospectos: 20, convertidos: 2 },
      { mes: 'Feb', prospectos: 35, convertidos: 5 },
      { mes: 'Mar', prospectos: 40, convertidos: 8 },
      { mes: 'Abr', prospectos: 30, convertidos: 4 },
      { mes: 'May', prospectos: 55, convertidos: 12 },
      { mes: 'Jun', prospectos: 60, convertidos: 15 },
    ];

    const categoryData = [
      { categoria: 'Restaurante', count: 45, scorePromedio: 75 },
      { categoria: 'Clínica', count: 25, scorePromedio: 82 },
      { categoria: 'Taller', count: 20, scorePromedio: 65 },
      { categoria: 'Peluquería', count: 15, scorePromedio: 70 },
    ];

    const cityData = [
      { ciudad: 'Ciudad de México', count: 50, convertidos: 10, tasaConversion: 20 },
      { ciudad: 'Monterrey', count: 30, convertidos: 5, tasaConversion: 16.6 },
      { ciudad: 'Guadalajara', count: 25, convertidos: 3, tasaConversion: 12 },
    ];

    return NextResponse.json({ kpis, monthlyData, categoryData, cityData });
  } catch (error) {
    console.error('Error en /api/dashboard:', error);
    return NextResponse.json({ error: 'Error al cargar datos del dashboard' }, { status: 500 });
  }
}
