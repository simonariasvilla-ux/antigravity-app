'use client';

import { useState, useCallback } from 'react';
import SearchForm, { SearchFormValues } from '@/components/SearchForm';
import ProspectCard from '@/components/ProspectCard';
import BatchSummaryCard from '@/components/BatchSummaryCard';
import type { Prospect, BatchSummary } from '@/types/prospect';

function calcBatchSummary(prospects: Prospect[]): BatchSummary {
  const scores = prospects.map((p) => p.score).filter((s) => s !== null) as number[];
  return {
    total: prospects.length,
    conSitioWeb: prospects.filter((p) => p.sitio_web).length,
    sinSitioWeb: prospects.filter((p) => !p.sitio_web).length,
    scorePromedio: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    altaOportunidad: prospects.filter((p) => (p.score ?? 0) >= 70).length,
    medianaOportunidad: prospects.filter((p) => (p.score ?? 0) >= 40 && (p.score ?? 0) < 70).length,
    bajaOportunidad: prospects.filter((p) => (p.score ?? 0) < 40).length,
  };
}

// Estado vacío — flujo en 3 pasos
function EmptyState({ onScrollToSearch }: { onScrollToSearch: () => void }) {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: '48px',
        marginBottom: '16px',
        filter: 'drop-shadow(0 0 20px rgba(124,58,237,0.5))',
      }}>
        🚀
      </div>
      <h1 className="gradient-text" style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.02em' }}>
        AntiGravity Prospecting
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--text-muted)', maxWidth: '480px', marginBottom: '48px', lineHeight: 1.7 }}>
        Deja de buscar clientes manualmente. Encuentra negocios que necesitan tu agencia en segundos.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', maxWidth: '760px', width: '100%', marginBottom: '48px' }}>
        {[
          {
            step: '1',
            emoji: '🔍',
            title: 'Busca negocios',
            desc: 'Selecciona país, ciudad y categoría. Google Places encuentra negocios reales al instante.',
          },
          {
            step: '2',
            emoji: '🤖',
            title: 'IA analiza y puntúa',
            desc: 'GPT-4o extrae datos clave y calcula un score de oportunidad (0-100) para cada negocio.',
          },
          {
            step: '3',
            emoji: '💾',
            title: 'Guarda tus prospectos',
            desc: 'Revisa, edita y con un clic añade los mejores prospectos a tu base de datos.',
          },
        ].map((item) => (
          <div key={item.step} className="step-card">
            <div className="step-number">{item.step}</div>
            <div style={{ fontSize: '28px' }}>{item.emoji}</div>
            <h3 style={{ fontWeight: 700, fontSize: '16px' }}>{item.title}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.desc}</p>
          </div>
        ))}
      </div>

      <button
        className="btn-primary glow-pulse"
        onClick={onScrollToSearch}
        style={{ fontSize: '15px', padding: '12px 32px' }}
      >
        🎯 Comenzar búsqueda
      </button>
    </div>
  );
}

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>( new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingIds, setSavingIds] = useState<Set<string | number>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string | number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  function scrollToSearch() {
    document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  async function handleSearch(values: SearchFormValues) {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setProspects([]);
    setSelectedIds(new Set());

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status} al buscar. Verifica tu configuración.`);
      }

      const loaded: Prospect[] = (data.prospects || []).map((p: Prospect, i: number) => ({
        ...p,
        id: `tmp-${i}-${Date.now()}`,
        estado: 'pendiente' as const,
        ciudad: values.ciudad,
        pais: values.pais,
        batch_id: `batch-${Date.now()}`,
      }));

      setProspects(loaded);
      // Seleccionar todos por defecto
      setSelectedIds(new Set(loaded.map((p) => p.id!)));
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al buscar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  function handleProspectChange(id: string | number, updated: Prospect) {
    setProspects((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }

  function handleRemove(id: string | number) {
    setProspects((prev) => prev.filter((p) => p.id !== id));
    setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
  }

  async function handleSaveOne(id: string | number) {
    const prospect = prospects.find((p) => p.id === id);
    if (!prospect) return;

    setSavingIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch('/api/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospects: [prospect] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');
      setSavedIds((prev) => new Set(prev).add(id));
      setSuccessMsg(`✅ "${prospect.nombre}" guardado. Ver en historial →`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSavingIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }
  }

  function handleSelect(id: string | number, selected: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) next.add(id); else next.delete(id);
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(prospects.map((p) => p.id!)));
  }

  function selectNone() {
    setSelectedIds(new Set());
  }

  async function handleSave() {
    const toSave = prospects.filter((p) => selectedIds.has(p.id!));
    if (!toSave.length) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospects: toSave }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status} al guardar. Verifica tu conexión.`);
      }

      setSuccessMsg(`✅ ${data.saved} prospectos guardados correctamente.`);
      // Marcar los guardados como no-seleccionados
      setProspects((prev) =>
        prev.map((p) => selectedIds.has(p.id!) ? { ...p, _saved: true } : p)
      );
      setSelectedIds(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  const summary = calcBatchSummary(prospects);
  const selectedCount = selectedIds.size;
  const hasProspects = prospects.length > 0;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Hero / Estado vacío */}
      {!searched && <EmptyState onScrollToSearch={scrollToSearch} />}

      {/* Sección de búsqueda */}
      <div id="search-section" style={{ marginBottom: '24px' }}>
        <SearchForm onSearch={handleSearch} loading={loading} />
      </div>

      {/* Mensajes */}
      {error && (
        <div className="alert alert-error">
          ❌ {error}
        </div>
      )}
      {successMsg && (
        <div className="alert alert-success">
          {successMsg}{' '}
          <a href="/historial" style={{ color: 'var(--cyan)', fontWeight: 600 }}>Ver en historial →</a>
        </div>
      )}

      {/* Resumen del lote */}
      {hasProspects && (
        <div style={{ marginBottom: '24px' }}>
          <BatchSummaryCard
            summary={summary}
            onSave={handleSave}
            saving={saving}
            selectedCount={selectedCount}
            totalCount={prospects.length}
          />
        </div>
      )}

      {/* Controles de selección */}
      {hasProspects && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            {prospects.length} negocios encontrados
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary" onClick={selectAll} style={{ padding: '5px 14px', fontSize: '13px' }}>
              Seleccionar todos
            </button>
            <button className="btn-secondary" onClick={selectNone} style={{ padding: '5px 14px', fontSize: '13px' }}>
              Deseleccionar
            </button>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Orden por score
            </span>
            <button
              className="btn-secondary"
              style={{ padding: '5px 14px', fontSize: '13px' }}
              onClick={() => setProspects((prev) => [...prev].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)))}
            >
              ↓ Mayor score
            </button>
          </div>
        </div>
      )}

      {/* Grid de tarjetas */}
      {hasProspects && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: '16px',
        }}>
          {prospects.map((prospect) => (
            <ProspectCard
              key={prospect.id}
              prospect={prospect}
              selected={selectedIds.has(prospect.id!)}
              onSelect={(sel) => handleSelect(prospect.id!, sel)}
              onChange={(updated) => handleProspectChange(prospect.id!, updated)}
              onRemove={() => handleRemove(prospect.id!)}
              onSave={() => handleSaveOne(prospect.id!)}
              saving={savingIds.has(prospect.id!)}
              saved={savedIds.has(prospect.id!)}
            />
          ))}
        </div>
      )}

      {/* Skeleton de carga */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '180px' }} />
          ))}
        </div>
      )}
    </div>
  );
}
