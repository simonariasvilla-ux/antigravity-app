// Supabase client y helpers
// Auto-crea tablas si la BD está vacía

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Prospect } from '@/types/prospect';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Supabase no configurado. Ve a /configuracion y añade SUPABASE_URL y SUPABASE_ANON_KEY.'
    );
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance;
}

// Reinicia la instancia cuando cambian las credenciales
export function resetSupabaseClient(): void {
  supabaseInstance = null;
}

// Auto-crea las tablas necesarias si no existen
export async function ensureTablesExist(): Promise<void> {
  const supabase = getSupabase();

  // Verificar si la tabla existe comprobando si podemos hacer una consulta
  const { error: checkError } = await supabase
    .from('prospects')
    .select('id')
    .limit(1);

  // Si el error no es de "tabla no existe", algo más está mal
  if (checkError && checkError.code !== '42P01') {
    // 42P01 = relation does not exist en PostgreSQL
    throw new Error(`Error al verificar tablas: ${checkError.message}`);
  }

  if (checkError?.code === '42P01') {
    // Crear tabla usando la API de Supabase (SQL via RPC si está disponible)
    // En Supabase, la creación de tablas se hace desde el dashboard o via migrations
    // Aquí dejamos instrucciones claras
    throw new Error(
      'La tabla "prospects" no existe en Supabase. ' +
      'Ejecuta el siguiente SQL en tu proyecto Supabase:\n\n' +
      CREATE_TABLE_SQL
    );
  }
}

export const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT,
  telefono TEXT,
  direccion TEXT,
  sitio_web TEXT,
  correo TEXT,
  redes_sociales JSONB,
  categoria TEXT,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente','contactado','interesado','convertido','descartado')),
  ciudad TEXT,
  pais TEXT,
  batch_id TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_prospects_estado ON prospects(estado);
CREATE INDEX IF NOT EXISTS idx_prospects_categoria ON prospects(categoria);
CREATE INDEX IF NOT EXISTS idx_prospects_ciudad ON prospects(ciudad);
CREATE INDEX IF NOT EXISTS idx_prospects_created_at ON prospects(created_at);
CREATE INDEX IF NOT EXISTS idx_prospects_batch_id ON prospects(batch_id);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prospects_updated_at
  BEFORE UPDATE ON prospects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
`.trim();

// CRUD de prospectos

export async function saveProspects(prospects: Prospect[]): Promise<Prospect[]> {
  const supabase = getSupabase();

  const toInsert = prospects.map((p) => ({
    nombre: p.nombre,
    telefono: p.telefono,
    direccion: p.direccion,
    sitio_web: p.sitio_web,
    correo: p.correo,
    redes_sociales: p.redes_sociales,
    categoria: p.categoria,
    score: p.score,
    estado: p.estado || 'pendiente',
    ciudad: p.ciudad,
    pais: p.pais,
    batch_id: p.batch_id,
    notas: p.notas,
  }));

  const { data, error } = await supabase
    .from('prospects')
    .insert(toInsert)
    .select();

  if (error) {
    throw new Error(`Error al guardar en Supabase: ${error.message}`);
  }

  return data as Prospect[];
}

export async function upsertProspect(prospect: Prospect): Promise<Prospect> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('prospects')
    .upsert({
      id: prospect.id,
      nombre: prospect.nombre,
      telefono: prospect.telefono,
      direccion: prospect.direccion,
      sitio_web: prospect.sitio_web,
      correo: prospect.correo,
      redes_sociales: prospect.redes_sociales,
      categoria: prospect.categoria,
      score: prospect.score,
      estado: prospect.estado,
      ciudad: prospect.ciudad,
      pais: prospect.pais,
      batch_id: prospect.batch_id,
      notas: prospect.notas,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error al actualizar prospecto: ${error.message}`);
  }

  return data as Prospect;
}

export async function getProspects(filters?: {
  estado?: string;
  categoria?: string;
  ciudad?: string;
  year?: number;
}): Promise<Prospect[]> {
  const supabase = getSupabase();

  let query = supabase
    .from('prospects')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.estado) query = query.eq('estado', filters.estado);
  if (filters?.categoria) query = query.eq('categoria', filters.categoria);
  if (filters?.ciudad) query = query.eq('ciudad', filters.ciudad);
  if (filters?.year) {
    const start = `${filters.year}-01-01`;
    const end = `${filters.year + 1}-01-01`;
    query = query.gte('created_at', start).lt('created_at', end);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Error al leer prospectos: ${error.message}`);
  }

  return (data ?? []) as Prospect[];
}

export async function updateProspectStatus(id: string, estado: string): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('prospects')
    .update({ estado, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw new Error(`Error al actualizar estado: ${error.message}`);
  }
}

export async function deleteProspects(ids: string[]): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('prospects')
    .delete()
    .in('id', ids);

  if (error) {
    throw new Error(`Error al eliminar prospectos: ${error.message}`);
  }
}
