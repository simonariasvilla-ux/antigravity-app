// Configuración de sesión simple con iron-session
// Demo: cualquier usuario/contraseña válidos entran

import { getIronSession, IronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  usuario?: string;
  autenticado?: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'antigravity-secret-key-cambiar-en-produccion-32chars',
  cookieName: 'antigravity_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 días
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function requireAuth(): Promise<SessionData> {
  const session = await getSession();
  if (!session.autenticado) {
    throw new Error('No autenticado. Por favor inicia sesión en /login.');
  }
  return session;
}
