'use client';

import { useState } from 'react';
import type { Prospect } from '@/types/prospect';

interface Props {
  prospect: Prospect;
  onChange: (updated: Prospect) => void;
  onRemove: () => void;
  onSave?: () => void;
  saving?: boolean;
  saved?: boolean;
  selected: boolean;
  onSelect: (selected: boolean) => void;
}

const ESTADOS = ['pendiente', 'contactado', 'interesado', 'convertido', 'descartado'] as const;
const CATEGORIAS = ['Restaurante', 'Peluquería', 'Taller', 'Clínica', 'Tienda', 'Hotel', 'Gimnasio', 'Farmacia', 'Cafetería', 'Otro'];

function ScorePill({ score }: { score: number | null }) {
  if (score === null) return <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>;
  const cls = score >= 70 ? 'score-pill score-high' : score >= 40 ? 'score-pill score-mid' : 'score-pill score-low';
  return <span className={cls}>{score}</span>;
}

function StatusBadge({ estado }: { estado: string }) {
  return <span className={`badge badge-${estado}`}>{estado}</span>;
}

export default function ProspectCard({ prospect, onChange, onRemove, onSave, saving, saved, selected, onSelect }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Prospect>(prospect);
  const [expanded, setExpanded] = useState(false);

  // Formatear teléfono para WhatsApp (solo dígitos)
  function getWhatsAppUrl(tel: string | null): string | null {
    if (!tel) return null;
    const digits = tel.replace(/\D/g, '');
    if (digits.length < 7) return null;
    return `https://wa.me/${digits}`;
  }

  function handleSaveDraft() {
    onChange(draft);
    setEditing(false);
  }

  function handleCancelDraft() {
    setDraft(prospect);
    setEditing(false);
  }

  function updateDraft(field: keyof Prospect, value: unknown) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  const scoreClass = prospect.score !== null && prospect.score >= 70
    ? 'high'
    : prospect.score !== null && prospect.score >= 40
    ? 'mid'
    : 'low';

  return (
    <div
      className={`glass-card fade-in`}
      style={{
        padding: '20px',
        position: 'relative',
        borderColor: selected ? 'var(--accent)' : undefined,
        boxShadow: selected ? '0 0 0 2px rgba(124,58,237,0.3)' : undefined,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
          style={{ marginTop: '4px', accentColor: 'var(--accent)', cursor: 'pointer', width: '16px', height: '16px' }}
          id={`select-${prospect.id || Math.random()}`}
          aria-label={`Seleccionar ${prospect.nombre}`}
        />

        {/* Nombre y score */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {editing ? (
            <input
              className="input-field"
              value={draft.nombre || ''}
              onChange={(e) => updateDraft('nombre', e.target.value || null)}
              placeholder="Nombre del negocio"
              style={{ fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}
            />
          ) : (
            <h3 style={{
              fontWeight: 700,
              fontSize: '15px',
              color: 'var(--text)',
              marginBottom: '4px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {prospect.nombre || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin nombre</span>}
            </h3>
          )}

          {/* Meta info */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <StatusBadge estado={editing ? draft.estado : prospect.estado} />
            {prospect.categoria && (
              <span style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '12px',
                background: 'var(--bg-elevated)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}>
                {prospect.categoria}
              </span>
            )}
            {prospect.ciudad && (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                📍 {prospect.ciudad}
              </span>
            )}
          </div>
        </div>

        {/* Score */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <ScorePill score={editing ? draft.score : prospect.score} />
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>SCORE</span>
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {/* WhatsApp */}
          {getWhatsAppUrl(prospect.telefono) && (
            <a
              href={getWhatsAppUrl(prospect.telefono)!}
              target="_blank"
              rel="noopener noreferrer"
              title={`Escribir a ${prospect.nombre} por WhatsApp`}
              style={{
                width: '30px', height: '30px', borderRadius: '6px',
                background: '#25D366', border: 'none',
                cursor: 'pointer', fontSize: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                textDecoration: 'none', flexShrink: 0,
              }}
            >
              💬
            </a>
          )}

          {/* Guardar en dashboard */}
          {onSave && (
            <button
              onClick={onSave}
              disabled={saving || saved}
              title={saved ? 'Ya guardado' : 'Guardar en dashboard'}
              style={{
                width: '30px', height: '30px', borderRadius: '6px',
                background: saved ? 'var(--success)' : 'var(--accent)',
                border: 'none', cursor: saved ? 'default' : 'pointer',
                fontSize: '14px', transition: 'all 200ms ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? '⏳' : saved ? '✅' : '💾'}
            </button>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            title={expanded ? 'Colapsar' : 'Expandir'}
            style={{
              width: '30px', height: '30px', borderRadius: '6px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              cursor: 'pointer', fontSize: '14px', transition: 'all 200ms ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {expanded ? '▲' : '▼'}
          </button>
          {!editing && (
            <button
              onClick={() => { setDraft(prospect); setEditing(true); setExpanded(true); }}
              title="Editar"
              style={{
                width: '30px', height: '30px', borderRadius: '6px',
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                cursor: 'pointer', fontSize: '14px', transition: 'all 200ms ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ✏️
            </button>
          )}
          <button
            onClick={onRemove}
            title="Eliminar de la lista"
            style={{
              width: '30px', height: '30px', borderRadius: '6px',
              background: 'transparent', border: '1px solid rgba(239,68,68,0.3)',
              cursor: 'pointer', fontSize: '14px', transition: 'all 200ms ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--danger)',
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Campos rápidos - siempre visibles */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: expanded ? '12px' : '0' }}>
        {/* Teléfono */}
        <div className="field-row">
          <span className="field-label">📞</span>
          {editing ? (
            <input className="input-field" value={draft.telefono || ''} onChange={(e) => updateDraft('telefono', e.target.value || null)} placeholder="Teléfono" style={{ fontSize: '13px', padding: '4px 8px' }} />
          ) : (
            <span style={{ fontSize: '13px', color: prospect.telefono ? 'var(--text)' : 'var(--text-muted)' }}>
              {prospect.telefono || '—'}
            </span>
          )}
        </div>

        {/* Sitio web */}
        <div className="field-row">
          <span className="field-label">🌐</span>
          {editing ? (
            <input className="input-field" value={draft.sitio_web || ''} onChange={(e) => updateDraft('sitio_web', e.target.value || null)} placeholder="Sitio web" style={{ fontSize: '13px', padding: '4px 8px' }} />
          ) : prospect.sitio_web ? (
            <a href={prospect.sitio_web} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: 'var(--cyan)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {prospect.sitio_web.replace(/^https?:\/\//, '')}
            </a>
          ) : (
            <span style={{ fontSize: '13px', color: 'var(--warning)', fontWeight: 500 }}>Sin web ⚡</span>
          )}
        </div>
      </div>

      {/* Detalle expandido */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

          {/* Dirección */}
          <div className="field-row">
            <span className="field-label" style={{ minWidth: '80px' }}>📍 Dir.</span>
            {editing ? (
              <input className="input-field" value={draft.direccion || ''} onChange={(e) => updateDraft('direccion', e.target.value || null)} placeholder="Dirección" style={{ fontSize: '13px', padding: '4px 8px' }} />
            ) : (
              <span style={{ fontSize: '13px', color: prospect.direccion ? 'var(--text)' : 'var(--text-muted)' }}>
                {prospect.direccion || '—'}
              </span>
            )}
          </div>

          {/* Correo */}
          <div className="field-row">
            <span className="field-label" style={{ minWidth: '80px' }}>✉️ Email</span>
            {editing ? (
              <input className="input-field" value={draft.correo || ''} onChange={(e) => updateDraft('correo', e.target.value || null)} placeholder="Correo electrónico" type="email" style={{ fontSize: '13px', padding: '4px 8px' }} />
            ) : (
              <span style={{ fontSize: '13px', color: prospect.correo ? 'var(--text)' : 'var(--text-muted)' }}>
                {prospect.correo || '—'}
              </span>
            )}
          </div>

          {/* Categoría (editable) */}
          {editing && (
            <div className="field-row">
              <span className="field-label" style={{ minWidth: '80px' }}>🏷️ Cat.</span>
              <select className="select-field" value={draft.categoria || ''} onChange={(e) => updateDraft('categoria', e.target.value || null)} style={{ fontSize: '13px', padding: '4px 8px' }}>
                <option value="">Sin categoría</option>
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          {/* Estado (editable) */}
          {editing && (
            <div className="field-row">
              <span className="field-label" style={{ minWidth: '80px' }}>📌 Estado</span>
              <select className="select-field" value={draft.estado} onChange={(e) => updateDraft('estado', e.target.value)} style={{ fontSize: '13px', padding: '4px 8px' }}>
                {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          )}

          {/* Score (editable) */}
          {editing && (
            <div className="field-row">
              <span className="field-label" style={{ minWidth: '80px' }}>⭐ Score</span>
              <input type="number" min="0" max="100" className="input-field" value={draft.score ?? ''} onChange={(e) => updateDraft('score', e.target.value ? parseInt(e.target.value) : null)} placeholder="0-100" style={{ fontSize: '13px', padding: '4px 8px', width: '80px' }} />
            </div>
          )}

          {/* Redes sociales */}
          {prospect.redes_sociales && !editing && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {Object.entries(prospect.redes_sociales)
                .filter(([, v]) => v)
                .map(([red, url]) => (
                  <a
                    key={red}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      color: 'var(--cyan)',
                      textDecoration: 'none',
                      textTransform: 'capitalize',
                    }}
                  >
                    {red}
                  </a>
                ))}
            </div>
          )}

          {/* Botones de edición */}
          {editing && (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button className="btn-secondary" onClick={handleCancelDraft} style={{ padding: '6px 14px', fontSize: '13px' }}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleSaveDraft} style={{ padding: '6px 14px', fontSize: '13px' }}>
                Guardar cambios
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
