# AntiGravity SaaS

Sistema avanzado de prospección local para agencias de diseño web. Automatiza la búsqueda de clientes potenciales, extrae datos clave con IA y permite el contacto automatizado vía WhatsApp.

## Características Principales

*   **Búsqueda Integrada:** Encuentra negocios por país, ciudad y categoría usando la API de Google Places (o un modo demo sin APIs).
*   **Análisis con IA (GPT-4o):** Extrae nombre, teléfono, dirección, sitio web, correos, redes sociales y asigna un *Score de Oportunidad* (0-100).
*   **Almacenamiento Híbrido:** Usa SQLite (vía WebAssembly con `sql.js`) de forma predeterminada para uso local sin fricción, con soporte opcional para Supabase en la nube.
*   **Agente de WhatsApp:** Vincula tu número vía código QR para que un agente de IA interactúe con los prospectos. Funciona en segundo plano y requiere autorización previa.
*   **Dashboard Analítico:** Visualiza KPIs, tasas de conversión y distribución de oportunidades con gráficos SVG puros sin dependencias externas.

## Stack Tecnológico

*   **Framework:** Next.js 16 (App Router, React 19)
*   **Lenguaje:** TypeScript
*   **Estilos:** TailwindCSS v4 + CSS Variables (Diseño adaptativo Claro/Oscuro)
*   **Base de datos:** `sql.js` (SQLite WASM) y `@supabase/supabase-js`
*   **IA:** `openai`
*   **WhatsApp:** `@whiskeysockets/baileys`
*   **Autenticación (Demo):** `iron-session`

## Instalación y Configuración

1.  **Clonar o descargar** el repositorio.
2.  **Instalar dependencias:**
    ```bash
    pnpm install
    ```
    *Nota: Asegúrate de usar pnpm. En Windows, algunos paquetes binarios requieren aprobación que ya está configurada en `pnpm-workspace.yaml`.*
3.  **Configurar Variables de Entorno:**
    Al iniciar la aplicación, ve a la ruta `/configuracion` (o haz clic en el menú) y añade tus claves:
    *   `OPENAI_API_KEY`: Para la extracción y calificación de prospectos.
    *   `GOOGLE_PLACES_API_KEY`: Para búsquedas de negocios reales.
    *   `SUPABASE_URL` y `SUPABASE_ANON_KEY` (Opcional): Si deseas almacenamiento en la nube.
4.  **Iniciar Servidor de Desarrollo:**
    ```bash
    pnpm dev
    ```
5.  Abre `http://localhost:3000` y usa el login de demostración con cualquier credencial.

## Estructura del Proyecto

*   `/app`: Rutas del App Router (`/`, `/dashboard`, `/historial`, `/whatsapp`, `/configuracion`, `/login`, `/api/...`).
*   `/components`: Componentes reutilizables UI (Tarjetas, Formulario, Sidebar).
*   `/lib`: Lógica central (OpenAI, Places, Supabase, SQLite, WhatsApp, Autenticación).
*   `/types`: Interfaces TypeScript (`prospect.ts`).
*   `/tests`: Pruebas de integración usando el Test Runner nativo de Node.js (`node:test`).

## Pruebas

Para ejecutar las pruebas:

```bash
pnpm test
```
