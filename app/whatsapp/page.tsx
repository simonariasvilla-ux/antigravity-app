'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface WAStatus {
  connected: boolean;
  qr?: string;
  phone?: string;
}

interface WAConfig {
  authorized_numbers: string[];
  agent_name: string;
}

export default function WhatsAppPage() {
  const [status, setStatus] = useState<WAStatus>({ connected: false });
  const [config, setConfig] = useState<WAConfig>({ authorized_numbers: [], agent_name: 'Agente AntiGravity' });
  const [loading, setLoading] = useState(true);
  const [newNumber, setNewNumber] = useState('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Polling para QR
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    function pollStatus() {
      fetch('/api/whatsapp')
        .then(res => res.json())
        .then(data => {
          if (data.status) setStatus(data.status);
          if (data.config && loading) setConfig(data.config);
          setLoading(false);
        })
        .catch(console.error);
    }

    pollStatus();
    interval = setInterval(pollStatus, 3000); // Poll cada 3s

    return () => clearInterval(interval);
  }, [loading]);

  async function handleConnect() {
    setMsg(null);
    try {
      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'connect' }),
      });
      if (!res.ok) throw new Error('Error al conectar');
      setMsg({ type: 'success', text: 'Iniciando conexión. Espera el QR...' });
    } catch (e) {
      setMsg({ type: 'error', text: 'No se pudo iniciar el servicio de WhatsApp' });
    }
  }

  async function handleDisconnect() {
    setMsg(null);
    try {
      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect' }),
      });
      if (!res.ok) throw new Error('Error al desconectar');
      setStatus({ connected: false });
    } catch (e) {
      setMsg({ type: 'error', text: 'Error al desconectar' });
    }
  }

  async function handleSaveConfig() {
    try {
      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_config', config }),
      });
      if (res.ok) {
        setMsg({ type: 'success', text: 'Configuración guardada correctamente' });
      } else {
        throw new Error('Error al guardar');
      }
    } catch (e) {
      setMsg({ type: 'error', text: 'Error al guardar configuración' });
    }
  }

  function addNumber() {
    if (!newNumber.trim()) return;
    const clean = newNumber.replace(/\D/g, '');
    if (!clean) return;
    
    if (!config.authorized_numbers.includes(clean)) {
      setConfig({ ...config, authorized_numbers: [...config.authorized_numbers, clean] });
    }
    setNewNumber('');
  }

  function removeNumber(num: string) {
    setConfig({ ...config, authorized_numbers: config.authorized_numbers.filter(n => n !== num) });
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Agente de WhatsApp</h1>
          <p style={{ color: 'var(--text-muted)' }}>Interactúa con tus prospectos directamente desde WhatsApp mediante IA.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          Estado: 
          {status.connected ? (
            <span className="badge badge-success" style={{ background: 'var(--success)', color: 'white', border: 'none' }}>🟢 Conectado</span>
          ) : (
            <span className="badge badge-danger" style={{ background: 'var(--danger)', color: 'white', border: 'none' }}>🔴 Desconectado</span>
          )}
        </div>
      </div>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Panel de Conexión */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>Conexión del Agente</h2>
          
          {status.connected ? (
            <>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📱</div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--success)', marginBottom: '8px' }}>Dispositivo Vinculado</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                El agente está activo y escuchando mensajes de los números autorizados.
              </p>
              <button className="btn-danger" onClick={handleDisconnect}>
                Desvincular Dispositivo
              </button>
            </>
          ) : status.qr ? (
            <>
              <div className="qr-container fade-in" style={{ marginBottom: '16px', background: '#ffffff', padding: '16px', borderRadius: '12px', display: 'inline-block' }}>
                <img src={status.qr} alt="QR Code para WhatsApp" style={{ width: '240px', height: '240px', display: 'block' }} />
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Abre WhatsApp en tu teléfono {'>'} Dispositivos vinculados {'>'} Vincular un dispositivo
              </p>
              <button className="btn-secondary" onClick={handleDisconnect} style={{ fontSize: '12px', padding: '6px 12px' }}>
                Cancelar
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: '64px', marginBottom: '16px', filter: 'grayscale(1)', opacity: 0.5 }}>📱</div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Conecta tu número de WhatsApp para activar el agente conversacional.
              </p>
              <button className="btn-primary" onClick={handleConnect}>
                Generar Código QR
              </button>
            </>
          )}
        </div>

        {/* Panel de Configuración */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>Ajustes del Agente</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Nombre del Agente</label>
              <input 
                type="text" 
                className="input-field" 
                value={config.agent_name}
                onChange={e => setConfig({...config, agent_name: e.target.value})}
                placeholder="Ej: Asistente AntiGravity"
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Así se presentará la IA a los prospectos.</span>
            </div>

            <div className="divider" style={{ margin: '0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Números Autorizados (Lista Blanca)</label>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Solo estos números podrán interactuar con el agente para revisar y aprobar acciones.
              </p>
              
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newNumber}
                  onChange={e => setNewNumber(e.target.value)}
                  placeholder="Ej: 34600123456 (incluye código país)"
                  onKeyDown={e => e.key === 'Enter' && addNumber()}
                />
                <button className="btn-secondary" onClick={addNumber}>Agregar</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                {config.authorized_numbers.length === 0 ? (
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '8px 0' }}>
                    No hay números autorizados. El agente ignorará todos los mensajes.
                  </div>
                ) : (
                  config.authorized_numbers.map(num => (
                    <div key={num} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '14px', fontFamily: 'monospace' }}>+{num}</span>
                      <button 
                        onClick={() => removeNumber(num)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                        title="Eliminar"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button className="btn-primary" onClick={handleSaveConfig}>
              💾 Guardar Ajustes
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
