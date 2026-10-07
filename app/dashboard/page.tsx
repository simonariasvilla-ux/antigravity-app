'use client';

import { useState, useEffect } from 'react';
import type { KPIs, MonthlyData, CategoryData, CityData } from '@/types/prospect';

export default function DashboardPage() {
  const [data, setData] = useState<{
    kpis: KPIs;
    monthlyData: MonthlyData[];
    categoryData: CategoryData[];
    cityData: CityData[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/dashboard?year=${year}`);
        if (!res.ok) throw new Error('Error al cargar datos');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [year]);

  if (error) {
    return <div className="alert alert-error m-6">{error}</div>;
  }

  if (loading || !data) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {Array.from({length: 4}).map((_, i) => <div key={i} className="skeleton" style={{ height: '120px' }} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <div className="skeleton" style={{ height: '300px' }} />
          <div className="skeleton" style={{ height: '300px' }} />
        </div>
      </div>
    );
  }

  const { kpis, monthlyData, categoryData, cityData } = data;

  // Calculos para gráficas SVG puras
  const maxMonthly = Math.max(...monthlyData.map(d => Math.max(d.prospectos, d.convertidos)));
  const maxCategory = Math.max(...categoryData.map(d => d.count));

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Dashboard de Conversión</h1>
          <p style={{ color: 'var(--text-muted)' }}>Métricas clave y rendimiento de prospección</p>
        </div>
        <div>
          <select className="select-field" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="kpi-card">
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Total Prospectos</div>
          <div className="kpi-value">{kpis.totalProspectos}</div>
        </div>
        <div className="kpi-card">
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Contactados</div>
          <div className="kpi-value" style={{ color: 'var(--info)' }}>{kpis.contactados}</div>
        </div>
        <div className="kpi-card">
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Convertidos (Clientes)</div>
          <div className="kpi-value" style={{ color: 'var(--success)' }}>{kpis.convertidos}</div>
        </div>
        <div className="kpi-card">
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Tasa de Conversión</div>
          <div className="kpi-value" style={{ color: 'var(--accent)' }}>{kpis.tasaConversion.toFixed(1)}%</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Evolución Mensual (SVG) */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>Evolución Mensual</h3>
          <div style={{ height: '240px', width: '100%', position: 'relative' }}>
            <svg width="100%" height="100%" viewBox={`0 0 ${monthlyData.length * 60} 200`} preserveAspectRatio="none">
              {/* Grid lines */}
              {[0, 1, 2, 3].map(i => (
                <line key={i} x1="0" y1={i * 50} x2="100%" y2={i * 50} stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />
              ))}
              
              {/* Barras Prospectos */}
              {monthlyData.map((d, i) => {
                const height = (d.prospectos / maxMonthly) * 180;
                const y = 180 - height;
                return (
                  <rect key={`p-${i}`} x={i * 60 + 10} y={y} width="16" height={height} fill="var(--info)" rx="4" opacity="0.5" />
                );
              })}

              {/* Barras Convertidos */}
              {monthlyData.map((d, i) => {
                const height = (d.convertidos / maxMonthly) * 180;
                const y = 180 - height;
                return (
                  <rect key={`c-${i}`} x={i * 60 + 26} y={y} width="16" height={height} fill="var(--success)" rx="4" />
                );
              })}

              {/* Labels X */}
              {monthlyData.map((d, i) => (
                <text key={`l-${i}`} x={i * 60 + 25} y="198" fontSize="12" fill="var(--text-muted)" textAnchor="middle">{d.mes}</text>
              ))}
            </svg>
          </div>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '16px', fontSize: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', background: 'var(--info)', opacity: 0.5, borderRadius: '2px' }}></div> Prospectos</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', background: 'var(--success)', borderRadius: '2px' }}></div> Convertidos</span>
          </div>
        </div>

        {/* Oportunidades por Categoría (SVG Horizontal Bars) */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>Oportunidades por Categoría</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {categoryData.map(cat => (
              <div key={cat.categoria} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span>{cat.categoria}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{cat.count} (Score: {cat.scorePromedio})</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${(cat.count / maxCategory) * 100}%`, 
                    height: '100%', 
                    background: 'linear-gradient(90deg, var(--accent), var(--cyan))',
                    borderRadius: '4px' 
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla Ciudades */}
      <div className="glass-card" style={{ padding: '24px', overflowX: 'auto' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>Rendimiento por Ciudad</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Ciudad</th>
              <th>Prospectos Totales</th>
              <th>Convertidos</th>
              <th>Tasa de Conversión</th>
            </tr>
          </thead>
          <tbody>
            {cityData.map(city => (
              <tr key={city.ciudad}>
                <td style={{ fontWeight: 500 }}>{city.ciudad}</td>
                <td>{city.count}</td>
                <td style={{ color: 'var(--success)' }}>{city.convertidos}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '40px' }}>{city.tasaConversion.toFixed(1)}%</span>
                    <div style={{ flex: 1, maxWidth: '100px', height: '6px', background: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${city.tasaConversion}%`, height: '100%', background: 'var(--accent)' }} />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
