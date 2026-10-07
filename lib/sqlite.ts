// SQLite local usando sql.js (WebAssembly - sin compilación nativa)
// Persiste en disco usando el archivo binario de la BD

import path from 'path';
import fs from 'fs';
import type { Prospect, ProspectStatus } from '@/types/prospect';

const DB_DIR = path.join(process.cwd(), '.antigravity');
const DB_PATH = path.join(DB_DIR, 'local.db');

// Tipos internos de sql.js (importación dinámica)
type SqlJsDatabase = {
  run: (sql: string, params?: unknown[]) => void;
  exec: (sql: string) => Array<{ columns: string[]; values: unknown[][] }>;
  export: () => Uint8Array;
  close: () => void;
};

let db: SqlJsDatabase | null = null;

async function getDb(): Promise<SqlJsDatabase> {
  if (db) return db;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  // Importación dinámica de sql.js (módulo ESM/CJS)
  const initSqlJs = (await import('sql.js')).default;
  const SQL = await initSqlJs();

  let database: SqlJsDatabase;

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    database = new SQL.Database(fileBuffer) as SqlJsDatabase;
  } else {
    database = new SQL.Database() as SqlJsDatabase;
    ensureLocalTables(database);
    persistDb(database);
  }

  db = database;
  return db;
}

function persistDb(database: SqlJsDatabase): void {
  const data = database.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function ensureLocalTables(database: SqlJsDatabase): void {
  database.run(`
    CREATE TABLE IF NOT EXISTS prospects (
      id TEXT PRIMARY KEY,
      nombre TEXT,
      telefono TEXT,
      direccion TEXT,
      sitio_web TEXT,
      correo TEXT,
      redes_sociales TEXT,
      categoria TEXT,
      score INTEGER,
      estado TEXT DEFAULT 'pendiente',
      ciudad TEXT,
      pais TEXT,
      batch_id TEXT,
      notas TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  database.run(`CREATE INDEX IF NOT EXISTS idx_local_estado ON prospects(estado)`);
  database.run(`CREATE INDEX IF NOT EXISTS idx_local_batch_id ON prospects(batch_id)`);
  database.run(`CREATE INDEX IF NOT EXISTS idx_local_created_at ON prospects(created_at)`);
}

function generateId(): string {
  return crypto.randomUUID();
}

function rowsToObjects(result: { columns: string[]; values: unknown[][] }): Record<string, unknown>[] {
  return result.values.map((row) =>
    Object.fromEntries(result.columns.map((col, i) => [col, row[i]]))
  );
}

function deserialize(row: Record<string, unknown>): Prospect {
  return {
    ...row,
    redes_sociales: row.redes_sociales
      ? JSON.parse(row.redes_sociales as string)
      : null,
    score: row.score !== null ? Number(row.score) : null,
    estado: (row.estado as ProspectStatus) || 'pendiente',
  } as Prospect;
}

export async function saveProspectsLocal(prospects: Prospect[]): Promise<Prospect[]> {
  const database = await getDb();
  const saved: Prospect[] = [];

  for (const p of prospects) {
    const id = p.id || generateId();
    database.run(
      `INSERT OR REPLACE INTO prospects (
        id, nombre, telefono, direccion, sitio_web, correo,
        redes_sociales, categoria, score, estado, ciudad, pais,
        batch_id, notas, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        id,
        p.nombre, p.telefono, p.direccion, p.sitio_web, p.correo,
        p.redes_sociales ? JSON.stringify(p.redes_sociales) : null,
        p.categoria, p.score, p.estado || 'pendiente',
        p.ciudad, p.pais, p.batch_id || null, p.notas || null,
      ]
    );
    saved.push({ ...p, id });
  }

  persistDb(database);
  return saved;
}

export function getProspectsLocal(filters?: {
  estado?: string;
  busqueda?: string;
  batch_id?: string;
}): Prospect[] {
  if (!db) return []; // Si no está inicializado, devuelve vacío

  let sql = 'SELECT * FROM prospects WHERE 1=1';
  const params: unknown[] = [];

  if (filters?.estado) {
    sql += ' AND estado = ?';
    params.push(filters.estado);
  }
  if (filters?.batch_id) {
    sql += ' AND batch_id = ?';
    params.push(filters.batch_id);
  }
  if (filters?.busqueda) {
    sql += ' AND (nombre LIKE ? OR ciudad LIKE ? OR categoria LIKE ?)';
    const term = `%${filters.busqueda}%`;
    params.push(term, term, term);
  }

  sql += ' ORDER BY created_at DESC';

  const results = db.exec(sql);
  if (!results.length) return [];
  return rowsToObjects(results[0]).map(deserialize);
}

export async function initLocalDb(): Promise<void> {
  await getDb();
}

export async function updateProspectStatusLocal(id: string, estado: ProspectStatus): Promise<void> {
  const database = await getDb();
  database.run(
    "UPDATE prospects SET estado = ?, updated_at = datetime('now') WHERE id = ?",
    [estado, id]
  );
  persistDb(database);
}

export async function updateProspectLocal(prospect: Prospect): Promise<void> {
  if (!prospect.id) throw new Error('No se puede actualizar un prospecto sin ID.');
  const database = await getDb();
  database.run(
    `UPDATE prospects SET
      nombre = ?, telefono = ?, direccion = ?, sitio_web = ?,
      correo = ?, redes_sociales = ?, categoria = ?, score = ?,
      estado = ?, notas = ?, updated_at = datetime('now')
    WHERE id = ?`,
    [
      prospect.nombre, prospect.telefono, prospect.direccion, prospect.sitio_web,
      prospect.correo,
      prospect.redes_sociales ? JSON.stringify(prospect.redes_sociales) : null,
      prospect.categoria, prospect.score, prospect.estado,
      prospect.notas || null, prospect.id,
    ]
  );
  persistDb(database);
}

export async function deleteProspectsLocal(ids: string[]): Promise<void> {
  const database = await getDb();
  for (const id of ids) {
    database.run('DELETE FROM prospects WHERE id = ?', [id]);
  }
  persistDb(database);
}

export function getProspectStatsLocal(): {
  total: number;
  porEstado: Record<string, number>;
  scorePromedio: number;
} {
  if (!db) return { total: 0, porEstado: {}, scorePromedio: 0 };

  const totalResult = db.exec('SELECT COUNT(*) as count FROM prospects');
  const total = totalResult.length ? Number(totalResult[0].values[0][0]) : 0;

  const byStatusResult = db.exec(
    'SELECT estado, COUNT(*) as count FROM prospects GROUP BY estado'
  );
  const porEstado: Record<string, number> = {};
  if (byStatusResult.length) {
    rowsToObjects(byStatusResult[0]).forEach((row) => {
      porEstado[row.estado as string] = Number(row.count);
    });
  }

  const avgResult = db.exec(
    'SELECT AVG(score) as avg FROM prospects WHERE score IS NOT NULL'
  );
  const scorePromedio = avgResult.length
    ? Math.round(Number(avgResult[0].values[0][0]) || 0)
    : 0;

  return { total, porEstado, scorePromedio };
}
