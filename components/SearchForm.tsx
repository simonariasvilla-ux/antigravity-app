'use client';

import { useState } from 'react';

const CATEGORIAS = [
  'Restaurante', 'Peluquería', 'Taller mecánico', 'Clínica dental',
  'Clínica médica', 'Farmacia', 'Tienda de ropa', 'Cafetería',
  'Hotel', 'Gimnasio', 'Spa', 'Óptica', 'Ferretería',
  'Inmobiliaria', 'Abogado', 'Contable', 'Dentista', 'Veterinaria', 'Otro',
];

const PAISES = [
  'México', 'España', 'Argentina', 'Colombia', 'Chile', 'Perú',
  'Venezuela', 'Ecuador', 'Bolivia', 'Uruguay', 'Paraguay',
  'Guatemala', 'Cuba', 'Honduras', 'El Salvador', 'Costa Rica',
  'Panamá', 'República Dominicana', 'Puerto Rico', 'Estados Unidos',
];

export interface SearchFormValues {
  pais: string;
  ciudad: string;
  categoria: string;
  cantidad: number;
  useMock: boolean;
}

interface Props {
  onSearch: (values: SearchFormValues) => void;
  loading: boolean;
}

export default function SearchForm({ onSearch, loading }: Props) {
  const [form, setForm] = useState<SearchFormValues>({
    pais: 'México',
    ciudad: '',
    categoria: 'Restaurante',
    cantidad: 10,
    useMock: false,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.ciudad.trim()) return;
    onSearch(form);
  }

  function update(field: keyof SearchFormValues, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Buscar negocios</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Encuentra prospectos potenciales con Google Places + IA
          </p>
        </div>
        {/* Toggle mock para demos sin API */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={form.useMock}
            onChange={(e) => update('useMock', e.target.checked)}
            style={{ accentColor: 'var(--warning)', cursor: 'pointer' }}
            id="toggle-mock"
          />
          Modo demo (sin APIs)
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        {/* País */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="pais" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            País
          </label>
          <select
            id="pais"
            className="select-field"
            value={form.pais}
            onChange={(e) => update('pais', e.target.value)}
          >
            {PAISES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Ciudad */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="ciudad" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Ciudad *
          </label>
          <input
            id="ciudad"
            className="input-field"
            type="text"
            value={form.ciudad}
            onChange={(e) => update('ciudad', e.target.value)}
            placeholder="Ej: Ciudad de México"
            required
          />
        </div>

        {/* Categoría */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="categoria" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Categoría
          </label>
          <select
            id="categoria"
            className="select-field"
            value={form.categoria}
            onChange={(e) => update('categoria', e.target.value)}
          >
            {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Cantidad */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="cantidad" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Cantidad (1-20)
          </label>
          <input
            id="cantidad"
            className="input-field"
            type="number"
            min="1"
            max="20"
            value={form.cantidad}
            onChange={(e) => update('cantidad', Math.min(20, Math.max(1, parseInt(e.target.value) || 10)))}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="submit"
          className="btn-primary"
          disabled={loading || !form.ciudad.trim()}
          id="btn-buscar"
          style={{ padding: '10px 28px', fontSize: '14px' }}
        >
          {loading ? (
            <><span className="spinner" style={{ width: '16px', height: '16px' }} /> Buscando...</>
          ) : (
            <>🔍 Buscar negocios</>
          )}
        </button>
      </div>

      {form.useMock && (
        <div className="alert alert-warning">
          ⚡ Modo demo activo: se usarán datos de ejemplo sin consumir APIs. Configura tus claves en <strong>/configuracion</strong> para búsquedas reales.
        </div>
      )}
    </form>
  );
}
