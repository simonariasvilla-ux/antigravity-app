import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { saveProspects as saveSupabase, getProspects as getSupabase } from '@/lib/supabase';
import { saveProspectsLocal, getProspectsLocal, initLocalDb } from '@/lib/sqlite';
import type { Prospect } from '@/types/prospect';

// Determina si Supabase está configurado
function isSupabaseConfigured() {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();
    const { prospects } = body as { prospects: Prospect[] };

    if (!Array.isArray(prospects) || prospects.length === 0) {
      return NextResponse.json({ error: 'Lista de prospectos inválida o vacía' }, { status: 400 });
    }

    // 1. Guardar en SQLite local SIEMPRE (para modo offline y caché local rápida)
    let savedLocal: Prospect[] = [];
    try {
      await initLocalDb();
      savedLocal = await saveProspectsLocal(prospects);
    } catch (e) {
      console.error('Error guardando en SQLite local:', e);
      // No fallar si solo falla local
    }

    // 2. Guardar en Supabase si está configurado
    let savedCloud = false;
    if (isSupabaseConfigured()) {
      try {
        await saveSupabase(prospects);
        savedCloud = true;
      } catch (e) {
        console.error('Error guardando en Supabase:', e);
        // Si falla cloud, pero local funcionó, devolvemos success parcial
        if (savedLocal.length === 0) {
          throw new Error('Falló el guardado en ambas bases de datos');
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      saved: prospects.length,
      local: savedLocal.length > 0,
      cloud: savedCloud
    });

  } catch (error) {
    console.error('Error en POST /api/prospects:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const filters = {
      estado: searchParams.get('estado') || undefined,
      ciudad: searchParams.get('ciudad') || undefined,
      categoria: searchParams.get('categoria') || undefined,
    };

    let data: Prospect[] = [];

    // Priorizar Supabase si está configurado
    if (isSupabaseConfigured()) {
      try {
        data = await getSupabase(filters);
      } catch (e) {
        console.error('Error leyendo de Supabase, cayendo a local:', e);
        await initLocalDb();
        data = getProspectsLocal(filters);
      }
    } else {
      await initLocalDb();
      data = getProspectsLocal(filters);
    }

    return NextResponse.json({ prospects: data });

  } catch (error) {
    console.error('Error en GET /api/prospects:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
