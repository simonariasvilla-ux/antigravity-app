'use client';

import type { BatchSummary } from '@/types/prospect';

interface Props {
  summary: BatchSummary;
  onSave: () => void;
  saving: boolean;
  selectedCount: number;
  totalCount: number;
}

export default function BatchSummaryCard({ summary, onSave, saving, selectedCount, totalCount }: Props) {
  const highPct = summary.total > 0 ? Math.round((summary.altaOportunidad / summary.total) * 100) : 0;

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
      flexWrap: 'wrap',
    }}>
      {/* Título */}
      <div style={{ flex: '1 1 200px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>
          Resumen del lote
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {selectedCount} de {totalCount} seleccionados para guardar
        </p>
      </div>

      {/* KPIs del lote */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)' }}>{summary.total}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total</div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--success)' }}>{summary.altaOportunidad}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Alta oport.</div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--warning)' }}>{summary.sinSitioWeb}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sin web</div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent)' }}>
            {summary.scorePromedio > 0 ? summary.scorePromedio : '—'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Score prom.</div>
        </div>
      </div>

      {/* Barra de oportunidades */}
      {summary.total > 0 && (
        <div style={{ flex: '1 1 200px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Distribución de oportunidades
          </div>
          <div style={{ height: '8px', borderRadius: '4px', overflow: 'hidden', display: 'flex', gap: '2px' }}>
            {summary.altaOportunidad > 0 && (
              <div style={{
                flex: summary.altaOportunidad,
                background: 'var(--success)',
                borderRadius: '4px',
              }} title={`Alta: ${summary.altaOportunidad}`} />
            )}
            {summary.medianaOportunidad > 0 && (
              <div style={{
                flex: summary.medianaOportunidad,
                background: 'var(--warning)',
                borderRadius: '4px',
              }} title={`Media: ${summary.medianaOportunidad}`} />
            )}
            {summary.bajaOportunidad > 0 && (
              <div style={{
                flex: summary.bajaOportunidad,
                background: 'var(--danger)',
                borderRadius: '4px',
              }} title={`Baja: ${summary.bajaOportunidad}`} />
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--success)' }}>● Alta ({summary.altaOportunidad})</span>
            <span style={{ color: 'var(--warning)' }}>● Media ({summary.medianaOportunidad})</span>
            <span style={{ color: 'var(--danger)' }}>● Baja ({summary.bajaOportunidad})</span>
          </div>
        </div>
      )}

      {/* Botón guardar */}
      <button
        className="btn-primary glow-pulse"
        onClick={onSave}
        disabled={saving || selectedCount === 0}
        style={{ fontSize: '14px', padding: '10px 24px', flexShrink: 0 }}
        id="btn-guardar-prospectos"
      >
        {saving ? (
          <><span className="spinner" style={{ width: '16px', height: '16px' }} /> Guardando...</>
        ) : (
          <>💾 Guardar Prospectos {selectedCount > 0 && `(${selectedCount})`}</>
        )}
      </button>
    </div>
  );
}
