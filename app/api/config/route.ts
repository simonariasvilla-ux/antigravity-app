import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import fs from 'fs';
import path from 'path';

const ENV_PATH = path.join(process.cwd(), '.env.local');

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    // Leer .env.local de forma segura (sin exponer secretos completos al cliente, solo indicando si existen)
    // Para simplificar la demo, devolvemos los valores actuales (en una app real esto sería inseguro)
    const envVars: Record<string, string> = {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
      GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY || '',
      SUPABASE_URL: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    };

    return NextResponse.json({ config: envVars });
  } catch (error) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    
    const body = await request.json();
    const { OPENAI_API_KEY, GOOGLE_PLACES_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY } = body;

    // Actualizar process.env en memoria (para que surta efecto sin reiniciar)
    if (OPENAI_API_KEY !== undefined) process.env.OPENAI_API_KEY = OPENAI_API_KEY;
    if (GOOGLE_PLACES_API_KEY !== undefined) process.env.GOOGLE_PLACES_API_KEY = GOOGLE_PLACES_API_KEY;
    if (SUPABASE_URL !== undefined) {
      process.env.SUPABASE_URL = SUPABASE_URL;
      process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE_URL;
    }
    if (SUPABASE_ANON_KEY !== undefined) {
      process.env.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
    }

    // Persistir en .env.local
    let envContent = '';
    if (fs.existsSync(ENV_PATH)) {
      envContent = fs.readFileSync(ENV_PATH, 'utf-8');
    }

    const updates = { OPENAI_API_KEY, GOOGLE_PLACES_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY };
    
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) continue;
      
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (envContent.match(regex)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    }

    fs.writeFileSync(ENV_PATH, envContent.trim() + '\n');

    // Forzar re-creación del cliente Supabase
    const { resetSupabaseClient } = await import('@/lib/supabase');
    resetSupabaseClient();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error guardando config:', error);
    return NextResponse.json({ error: 'Error guardando configuración' }, { status: 500 });
  }
}
