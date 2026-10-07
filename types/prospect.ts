// Tipos principales de AntiGravity

export type ProspectStatus = 'pendiente' | 'contactado' | 'interesado' | 'convertido' | 'descartado';

export interface RedesSociales {
  facebook?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
}

export interface Prospect {
  id?: string;
  nombre: string | null;
  telefono: string | null;
  direccion: string | null;
  sitio_web: string | null;
  correo: string | null;
  redes_sociales: RedesSociales | null;
  categoria: string | null;
  score: number | null; // 0-100
  estado: ProspectStatus;
  ciudad: string | null;
  pais: string | null;
  batch_id?: string | null;
  notas?: string | null;
  created_at?: string;
  updated_at?: string;
  // Campo local para UI
  seleccionado?: boolean;
  editando?: boolean;
}

export interface SearchParams {
  pais: string;
  ciudad: string;
  categoria: string;
  cantidad: number;
  query?: string;
}

export interface BatchSummary {
  total: number;
  conSitioWeb: number;
  sinSitioWeb: number;
  scorePromedio: number;
  altaOportunidad: number; // score >= 70
  medianaOportunidad: number; // score 40-69
  bajaOportunidad: number; // score < 40
}

export interface KPIs {
  totalProspectos: number;
  contactados: number;
  interesados: number;
  convertidos: number;
  tasaConversion: number;
  scorePromedio: number;
}

export interface MonthlyData {
  mes: string;
  prospectos: number;
  convertidos: number;
}

export interface CategoryData {
  categoria: string;
  count: number;
  scorePromedio: number;
}

export interface CityData {
  ciudad: string;
  count: number;
  convertidos: number;
  tasaConversion: number;
}

export interface QuarterlyData {
  trimestre: string;
  prospectos: number;
  convertidos: number;
  tasaConversion: number;
}

// Respuesta de OpenAI con JSON Schema
export interface OpenAIProspectResponse {
  prospectos: Array<{
    nombre: string | null;
    telefono: string | null;
    direccion: string | null;
    sitio_web: string | null;
    correo: string | null;
    redes_sociales: RedesSociales | null;
    categoria: string | null;
    score: number | null;
    razon_score: string | null;
  }>;
}

// Config del sistema
export interface SystemConfig {
  openai_api_key: string;
  google_places_api_key: string;
  supabase_url: string;
  supabase_anon_key: string;
  max_prospects_per_search: number;
  default_country: string;
  whatsapp_authorized_numbers: string[];
}

// WhatsApp
export interface WhatsAppMessage {
  from: string;
  body: string;
  timestamp: number;
}

export interface WhatsAppSender {
  numero: string;
  nombre: string;
  autorizado: boolean;
}
