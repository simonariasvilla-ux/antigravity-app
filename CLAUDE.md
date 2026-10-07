# AntiGravity Project Guidelines

## Comandos

*   **Instalar:** `pnpm install`
*   **Desarrollo:** `pnpm dev`
*   **Build:** `pnpm build`
*   **Tests:** `pnpm test` (Usa Node.js test runner con `tsx`)
*   **Lint:** `pnpm eslint .`
*   **Typecheck:** `pnpm tsc --noEmit`

## Reglas de Arquitectura

*   **Next.js 16 (App Router):** Todos los componentes son Server Components por defecto, a menos que usen interactividad (añadir `'use client'` al principio).
*   **Estilos:** Usar **TailwindCSS v4** y variables CSS (`var(--bg)`, `var(--accent)`). **No usar librerías de componentes UI**, **no usar librerías de iconos** (usar emojis o SVGs inline), **no usar librerías de gráficos** (usar SVG puro).
*   **Base de datos local:** Usar `sql.js` (WebAssembly) envuelto en `/lib/sqlite.ts`. **No usar dependencias nativas como `sqlite3` o `better-sqlite3`** (pueden fallar en entornos Windows sin Python/C++ build tools).
*   **Respuestas OpenAI:** Siempre usar **Structured Outputs** (JSON Schema vía `response_format`) para asegurar un parseo estricto y evitar fallos.
*   **Integración WhatsApp:** Mantener aislada en `/lib/whatsapp.ts` usando `@whiskeysockets/baileys`. El agente debe recibir un contexto estructurado en JSON de los prospectos y usar function calling para ejecutar acciones de negocio, mitigando el *prompt injection*.
*   **Convenciones:** 
    *   Interfaces en `/types`.
    *   Componentes exportan como `default function`.
    *   Nombres de archivos en kebab-case o PascalCase (dependiendo del tipo).
    *   Utilizar *graceful degradation*: Si una API o base de datos externa falla, mostrar alertas UI en lugar de crashear. Proveer un "modo demo" (mock) donde aplique.
