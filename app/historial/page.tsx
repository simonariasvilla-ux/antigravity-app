'use client';

import { useState, useEffect } from 'react';
import type { Prospect } from '@/types/prospect';
import ProspectCard from '@/components/ProspectCard';

export default function HistorialPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [busqueda, setBusqueda] = useState<string>('');

  // Selección en lote
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  useEffect(() => {
    fetchProspects();
  }, [filtroEstado, busqueda]);

  async function fetchProspects() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filtroEstado) params.append('estado', filtroEstado);
      if (busqueda) params.append('busqueda', busqueda);

      const res = await fetch(`/api/prospects?${params.toString()}`);
      if (!res.ok) throw new Error('Error al cargar historial');
      
      const data = await res.json();
      setProspects(data.prospects || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(id: string | number, selected: boolean) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (selected) next.add(id); else next.delete(id);
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(prospects.map(p => p.id!)));
  }

  function selectNone() {
    setSelectedIds(new Set());
  }

  // Las funciones de actualización y borrado del historial se harían con llamadas API
  // Para esta versión inicial nos enfocamos en ver la lista y filtrar
  
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Historial de Prospectos</h1>
          <p style={{ color: 'var(--text-muted)' }}>Gestiona los negocios guardados en tu base de datos</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="🔍 Buscar por nombre, ciudad..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div style={{ width: '200px' }}>
          <select className="select-field" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="contactado">Contactado</option>
            <option value="interesado">Interesado</option>
            <option value="convertido">Convertido</option>
            <option value="descartado">Descartado</option>
          </select>
        </div>
      </div>

      {/* Acciones en lote */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{prospects.length} resultados</span>
        <div style={{ width: '1px', height: '16px', background: 'var(--border)', margin: '0 8px' }}></div>
        <button className="btn-secondary" onClick={selectAll} style={{ padding: '4px 12px', fontSize: '12px' }}>Seleccionar todos</button>
        <button className="btn-secondary" onClick={selectNone} style={{ padding: '4px 12px', fontSize: '12px' }}>Deseleccionar</button>
        
        {selectedIds.size > 0 && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              {selectedIds.size} seleccionados
            </span>
          </div>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px' }}>
          {Array.from({length: 6}).map((_, i) => <div key={i} className="skeleton" style={{ height: '180px' }} />)}
        </div>
      ) : prospects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 24px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No hay prospectos</h3>
          <p style={{ color: 'var(--text-muted)' }}>No se encontraron prospectos con los filtros actuales.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: '16px',
        }}>
          {prospects.map((p) => (
            <ProspectCard
              key={p.id}
              prospect={p}
              selected={selectedIds.has(p.id!)}
              onSelect={(sel) => handleSelect(p.id!, sel)}
              onChange={() => {}} // TODO: Implementar actualización a la BD
              onRemove={() => {}} // TODO: Implementar borrado a la BD
            />
          ))}
        </div>
      )}
    </div>
  );
}
