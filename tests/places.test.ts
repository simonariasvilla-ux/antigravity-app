import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getMockPlaces } from '../lib/places';

describe('Places Lib', () => {
  it('getMockPlaces returns correct number of items', () => {
    const res = getMockPlaces('Restaurante', 'Madrid', 5);
    
    assert.strictEqual(res.results.length, 5);
    assert.strictEqual(res.status, 'OK_MOCK');
    
    // Validar estructura básica
    assert.ok(res.results[0].name.includes('Restaurante'));
    assert.ok(res.results[0].formatted_address?.includes('Madrid'));
    assert.ok(res.rawText.includes('[Negocio 1]'));
  });

  it('getMockPlaces generates websites occasionally', () => {
    const res = getMockPlaces('Clínica', 'Bogotá', 6);
    const withWeb = res.results.filter(r => r.website);
    
    assert.ok(withWeb.length > 0, 'Debería haber al menos un sitio web');
  });
});
