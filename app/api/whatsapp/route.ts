import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { getWAStatus, loadWAConfig, saveWAConfig, connectWhatsApp, disconnectWhatsApp } from '@/lib/whatsapp';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    
    const status = getWAStatus();
    const config = loadWAConfig();

    return NextResponse.json({ status, config });
  } catch (error) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    
    const body = await request.json();
    const { action, config } = body;

    if (action === 'connect') {
      // Iniciamos conexión en background (el QR se enviará por polling en GET)
      connectWhatsApp().catch(e => console.error('Error WhatsApp bg:', e));
      return NextResponse.json({ success: true, message: 'Iniciando conexión...' });
    }
    
    if (action === 'disconnect') {
      await disconnectWhatsApp();
      return NextResponse.json({ success: true, message: 'Desconectado' });
    }

    if (action === 'save_config') {
      if (config) {
        // Limpiar números para guardar solo dígitos
        const cleanNumbers = (config.authorized_numbers || []).map((n: string) => n.replace(/\\D/g, ''));
        saveWAConfig({ ...config, authorized_numbers: cleanNumbers });
        return NextResponse.json({ success: true, message: 'Configuración guardada' });
      }
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (error) {
    console.error('Error en WhatsApp API:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
