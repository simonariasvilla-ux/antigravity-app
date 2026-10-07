'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const NAV_LINKS = [
  { href: '/', label: 'Prospectos', emoji: '🎯' },
  { href: '/historial', label: 'Historial', emoji: '📋' },
  { href: '/dashboard', label: 'Dashboard', emoji: '📊' },
  { href: '/whatsapp', label: 'WhatsApp', emoji: '💬' },
  { href: '/configuracion', label: 'Configuración', emoji: '⚙️' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ag-theme') as 'dark' | 'light' | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('ag-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  }

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' });
    window.location.href = '/login';
  }

  return (
    <nav className="navbar">
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--accent), var(--cyan))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            flexShrink: 0,
          }}>
            🚀
          </div>
          <span style={{
            fontWeight: 800,
            fontSize: '16px',
            background: 'linear-gradient(135deg, var(--accent), var(--cyan))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.02em',
          }}>
            AntiGravity
          </span>
        </Link>

        {/* Nav links - Desktop */}
        <div style={{ display: 'flex', gap: '4px', flex: 1, justifyContent: 'center' }}
          className="nav-links-desktop">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: active ? 600 : 400,
                  textDecoration: 'none',
                  color: active ? 'var(--accent)' : 'var(--text-muted)',
                  background: active ? 'rgba(124,58,237,0.1)' : 'transparent',
                  border: active ? '1px solid rgba(124,58,237,0.2)' : '1px solid transparent',
                  transition: 'all 200ms ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ fontSize: '14px' }}>{link.emoji}</span>
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              transition: 'all 200ms ease',
            }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              background: 'transparent',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--text-muted)',
              transition: 'all 200ms ease',
            }}
          >
            Salir
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
