import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { saveProspectsLocal, getProspectsLocal, deleteProspectsLocal, getProspectStatsLocal, initLocalDb } from '../lib/sqlite';

describe('SQLite Lib (sql.js)', () => {
  beforeEach(async () => {
    // Iniciar DB y limpiar para cada test
    await initLocalDb();
    const all = getProspectsLocal();
    if (all.length) {
      await deleteProspectsLocal(all.map(p => p.id!));
    }
  });

  it('can save and retrieve prospects', async () => {
    const prospects = [
      {
        nombre: 'Test 1',
        telefono: '1234',
        direccion: 'Dir 1',
        sitio_web: null,
        correo: null,
        redes_sociales: null,
        categoria: 'Test',
        score: 80,
        estado: 'pendiente' as const,
        ciudad: 'Ciudad X',
        pais: 'Pais Y'
      }
    ];

    await saveProspectsLocal(prospects);
    
    const saved = getProspectsLocal();
    assert.strictEqual(saved.length, 1);
    assert.strictEqual(saved[0].nombre, 'Test 1');
    assert.strictEqual(saved[0].score, 80);
    assert.ok(saved[0].id);
  });

  it('calculates correct stats', async () => {
    const prospects = [
      {
        nombre: 'Test 1', telefono: null, direccion: null, sitio_web: null, correo: null,
        redes_sociales: null, categoria: null, score: 50, estado: 'pendiente' as const, ciudad: null, pais: null
      },
      {
        nombre: 'Test 2', telefono: null, direccion: null, sitio_web: null, correo: null,
        redes_sociales: null, categoria: null, score: 90, estado: 'contactado' as const, ciudad: null, pais: null
      }
    ];

    await saveProspectsLocal(prospects);
    
    const stats = getProspectStatsLocal();
    assert.strictEqual(stats.total, 2);
    assert.strictEqual(stats.scorePromedio, 70); // (50+90)/2
    assert.strictEqual(stats.porEstado['pendiente'], 1);
    assert.strictEqual(stats.porEstado['contactado'], 1);
  });
});
