# VeloxAdmin

Panel de administración (web, mobile-first) para propietarios de negocios
gastronómicos dentro de Velox: pedidos, ventas POS, caja, inventario y
reportes. Construido con **Next.js 16 (App Router) + TypeScript + Tailwind
CSS v4**, con un tema visual morado → azul.

Este proyecto está pensado también como material de aprendizaje de Next.js:
la estructura sigue las convenciones estándar del framework y cada parte
tiene un propósito concreto que se explica abajo.

## Cómo correrlo

```bash
npm install
cp .env.local.example .env.local   # ajusta VELOX_API_BASE_URL
npm run dev
```

Abre http://localhost:3000 — te va a redirigir a `/login`.

## ⚠️ Antes de usarlo: revisa las rutas de la API

No tenía `routes/api.php`, así que **asumí** un prefijo de rutas
(`/api/admin/...`) basado en el namespace `App\Http\Controllers\Api\Admin`
de tus controllers. Si las rutas reales son distintas, el único archivo que
hay que tocar es:

```
lib/api/config.ts
```

Ahí están listados los 16 endpoints, uno por método de `AuthController`,
`DashboardController`, `OrdersController`, `InventoryController`,
`CashController` y `ReportsController`.

## Estructura del proyecto (para aprender Next.js)

```
app/
  page.tsx                    → redirige "/" a "/dashboard"
  login/page.tsx               → pantalla de login (Client Component)
  api/auth/login/route.ts      → Route Handler: llama a Laravel, guarda el
                                  token en un cookie httpOnly (nunca llega
                                  al navegador)
  api/auth/logout/route.ts     → cierra sesión
  (dashboard)/                 → "route group": agrupa páginas que comparten
    layout.tsx                    el layout con sidebar + topbar + nav móvil
    dashboard/page.tsx         → resumen general (StatCards + gráficos)
    pedidos/page.tsx           → OrdersController (summary/recent/pending)
    inventario/page.tsx        → InventoryController (alerts/consumption)
    caja/page.tsx               → CashController (current/sessions)
    caja/[id]/page.tsx          → CashController (detalle de una sesión)
    reportes/page.tsx           → ReportsController (5 endpoints)

middleware.ts                 → protege las rutas: sin cookie de sesión,
                                 redirige a /login

lib/
  api/config.ts                → URLs de la API (ajustar aquí si difieren)
  api/types.ts                 → tipos TS que reflejan el JSON de cada
                                  controller Laravel, 1 a 1
  api/server.ts                → fetch tipado que agrega el Bearer token
                                  automáticamente (solo se usa en el server)
  api/queries.ts                → una función por endpoint (getDashboardSummary,
                                  getOrdersRecent, getCashSessionDetail, etc.)
  auth/session.ts               → maneja el cookie httpOnly del token
  format.ts                     → helpers de moneda (COP), fechas y labels

components/
  ui/                            → primitivos de interfaz (botón, card, tabla,
                                  tabs, badge...) estilo shadcn/ui, escritos a
                                  mano, con el tema morado/azul aplicado
  layout/                        → sidebar (desktop), nav inferior (mobile),
                                  topbar con menú de usuario
  dashboard/                     → StatCard y gráficos (Recharts)
  shared/                        → filtro de fechas, estado vacío
```

## Patrón de datos: Server Components

Casi todas las páginas son **Server Components async**: hacen `fetch` a la
API de Laravel directamente en el servidor (usando el token guardado en el
cookie), sin exponer el token al navegador ni necesitar un estado de
"loading" manual. Cuando cambias el rango de fechas (`DateRangeFilter`,
un Client Component), se actualiza la URL (`?from=...&to=...`) y Next.js
vuelve a ejecutar el Server Component automáticamente.

Es un buen punto de partida para entender la diferencia entre Server y
Client Components en Next.js App Router — busca `"use client"` al inicio
de los archivos para ver cuáles son interactivos.

## Pendiente / siguientes pasos sugeridos

- Confirmar y ajustar las rutas reales en `lib/api/config.ts`.
- Agregar manejo de refresh token / expiración (hoy el cookie dura 30 días,
  igual que el token de Laravel).
- Acciones de escritura (crear producto, registrar egreso, abrir/cerrar
  caja) — por ahora el panel es de solo lectura porque los controllers
  que compartiste son de consulta.
- Opcional: modo claro además del oscuro actual.
