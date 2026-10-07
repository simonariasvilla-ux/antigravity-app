'use client';

import { useState, useEffect } from 'react';

export default function ConfiguracionPage() {
  const [form, setForm] = useState({
    OPENAI_API_KEY: '',
    GOOGLE_PLACES_API_KEY: '',
    SUPABASE_URL: '',
    SUPABASE_ANON_KEY: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data.config) {
          setForm({
            OPENAI_API_KEY: data.config.OPENAI_API_KEY || '',
            GOOGLE_PLACES_API_KEY: data.config.GOOGLE_PLACES_API_KEY || '',
            SUPABASE_URL: data.config.SUPABASE_URL || '',
            SUPABASE_ANON_KEY: data.config.SUPABASE_ANON_KEY || '',
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setMsg({ type: 'success', text: 'Configuración guardada correctamente. Ya puedes usar todas las funciones.' });
      } else {
        throw new Error('Error al guardar');
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Hubo un error al guardar la configuración.' });
    } finally {
      setSaving(false);
    }
  }

  const isConfigured = {
    openai: !!form.OPENAI_API_KEY,
    places: !!form.GOOGLE_PLACES_API_KEY,
    supabase: !!form.SUPABASE_URL && !!form.SUPABASE_ANON_KEY,
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Configuración</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Ajusta las claves de API y servicios externos.</p>

      {/* Checklist */}
      <div style={{ display: 'grid', gap: '12px', marginBottom: '32px' }}>
        <div className={`checklist-item ${isConfigured.openai ? 'done' : 'missing'}`}>
          <span style={{ fontSize: '20px' }}>{isConfigured.openai ? '✅' : '⚠️'}</span>
          <div>
            <div style={{ fontWeight: 600 }}>OpenAI GPT-4o</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Requerido para extracción y scoring.</div>
          </div>
        </div>
        <div className={`checklist-item ${isConfigured.places ? 'done' : 'missing'}`}>
          <span style={{ fontSize: '20px' }}>{isConfigured.places ? '✅' : '⚠️'}</span>
          <div>
            <div style={{ fontWeight: 600 }}>Google Places API</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Requerido para búsquedas reales (modo no demo).</div>
          </div>
        </div>
        <div className={`checklist-item ${isConfigured.supabase ? 'done' : 'pending'}`}>
          <span style={{ fontSize: '20px' }}>{isConfigured.supabase ? '✅' : 'ℹ️'}</span>
          <div>
            <div style={{ fontWeight: 600 }}>Supabase</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Opcional. Si no se configura, los datos se guardan en local (SQLite).</div>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`alert alert-${msg.type}`}>
          {msg.text}
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSave} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🤖 Inteligencia Artificial
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>OpenAI API Key</label>
            <input 
              type="password" 
              className="input-field" 
              value={form.OPENAI_API_KEY}
              onChange={(e) => setForm({...form, OPENAI_API_KEY: e.target.value})}
              placeholder="sk-..."
            />
          </div>
        </div>

        <div className="divider" style={{ margin: '8px 0' }} />

        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🌍 Búsqueda
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Google Places API Key</label>
            <input 
              type="password" 
              className="input-field" 
              value={form.GOOGLE_PLACES_API_KEY}
              onChange={(e) => setForm({...form, GOOGLE_PLACES_API_KEY: e.target.value})}
              placeholder="AIzaSy..."
            />
          </div>
        </div>

        <div className="divider" style={{ margin: '8px 0' }} />

        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ☁️ Base de Datos en la Nube
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Supabase URL</label>
              <input 
                type="url" 
                className="input-field" 
                value={form.SUPABASE_URL}
                onChange={(e) => setForm({...form, SUPABASE_URL: e.target.value})}
                placeholder="https://xyz.supabase.co"
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Supabase Anon Key</label>
              <input 
                type="password" 
                className="input-field" 
                value={form.SUPABASE_ANON_KEY}
                onChange={(e) => setForm({...form, SUPABASE_ANON_KEY: e.target.value})}
                placeholder="eyJhbG..."
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button type="submit" className="btn-primary" disabled={loading || saving}>
            {saving ? 'Guardando...' : '💾 Guardar Configuración'}
          </button>
        </div>
      </form>
    </div>
  );
}
