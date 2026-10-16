# PROGRESS — Dashboard de administración de TrabajaYa

> El agente lee este archivo al empezar y lo actualiza al terminar cada tarea.
> Solo una tarea puede estar "En curso" a la vez.

## En curso
- **T5 — Detalle del técnico:** perfil, documentos con visor y acciones (aprobar, observar, rechazar, suspender, reactivar).

## Pendientes (en orden)
- [ ] T6 — Lista de reportes con filtros (GET /admin/reportes) y detalle con resolución (PATCH /admin/reportes/:id)
- [ ] T7 — Reseñas: ocultar reseña desde el detalle del reporte (POST /admin/resenas/:id/ocultar)
- [ ] T8 — Cancelaciones tardías (GET /admin/cancelaciones-tardias)
- [ ] T9 — Pulido visual: responsive, estados de carga, errores y mensajes vacíos en todas las pantallas

## Hechas
- [x] **T0 — Configuración inicial** (2026-10-15): estructura de carpetas (`pages`, `components`, `services`, `hooks`, `context`), variables de color en `@theme` (`src/index.css`), `AuthContext` + `useAuth`, instancia de Axios con interceptores (`src/services/api.ts`), React Router con ruta de login y rutas protegidas (`ProtectedRoute`). `.env` / `.env.example` creados y `.env` ignorado por git. `npm run lint` y `npm run build` en verde; rutas verificadas en navegador.
- [x] **T1 — Pantalla de login** (2026-10-16): formulario (email + contraseña) en `src/pages/Login/Login.tsx`, servicio `loginAdmin` (`src/services/auth.ts`) que llama a `POST /auth/admin/login`, guarda token y usuario vía `AuthContext` y redirige a `/dashboard`. Si ya hay sesión, redirige al dashboard. Manejo de errores en español usando el mensaje del backend. `npm run lint` y `npm run build` en verde. **Verificado de extremo a extremo en navegador**: login `200`, token/usuario en localStorage y redirección a `/dashboard`; con contraseña incorrecta muestra "Credenciales incorrectas".
- [x] **T2 — Layout base** (2026-10-16): shell `AppLayout` (sidebar + header + `Outlet`) que envuelve las rutas protegidas. `Sidebar` claro (`bg-white`) con marca, navegación (`NavLink` con estado activo), tarjeta del admin y **colapso a modo iconos en desktop**. `Header` sticky con título dinámico según ruta y menú del admin con "Cerrar sesión". Drawer móvil con overlay. Íconos SVG inline propios (`icons.tsx`) y config de navegación (`navigation.ts`). Páginas placeholder ("En construcción") para Técnicos, Reportes y Cancelaciones tardías. `npm run lint` y `npm run build` en verde; verificado en navegador (colapso, drawer móvil, navegación, logout).
- [x] **T3 — Dashboard** (2026-10-16): métricas reales sin endpoint de métricas, derivadas de los existentes: `GET /admin/tecnicos` (agrupado por `estadoVerificacion`) y `GET /admin/reportes?estado=pendiente&limit=1` (`paginacion.total`). 4 KPI cards (reportes abiertos, técnicos totales, verificados, en revisión), panel "Técnicos por estado" con barras y porcentajes, y estados de carga (skeletons), error con botón "Reintentar" y vacío. Servicios en `src/services/admin.ts`, hook `useDashboard`, `StatCard` y mapa de estados en `src/components/estados.ts`. Tokens `success`/`warning`/`danger` añadidos a `@theme`. `lint` y `build` en verde; verificado en navegador (agregación con datos simulados por intercepción, error 500 y reintento).
- [x] **T4 — Lista de técnicos** (2026-10-16): tabla con filtro por estado de verificación (chips "Todos" + 6 estados) que consulta `GET /admin/tecnicos` (con `?estado=` opcional, filtrado en servidor). Columnas: técnico (avatar con iniciales + nombre/email), oficio, distritos, experiencia, estado (badge con color) y fecha de registro; columnas de detalle ocultas en pantallas pequeñas. Hook `useTecnicos` (`cambiarEstado`/`recargar`), tipo `Tecnico` ampliado en `src/services/admin.ts`. Estados de carga (skeleton de filas), error con "Reintentar", vacío general y vacío por filtro. `lint` y `build` en verde; verificado en navegador (render, filtro → `?estado=en_revision`, vacío y error 500 con reintento).

## Notas y decisiones
- Paleta: #1976D2 azul principal, #071B36 texto oscuro, negro para texto general.
- Sin librerías de UI: solo CSS con variables. (Se descartó `shadcn/ui` por la regla 6 de AGENTS.md; el sidebar colapsable se implementó a mano con Tailwind, inspirado en el de shadcn.)
- Token en localStorage con clave trabajaya_admin_token.
- El backend corre en VITE_API_URL (definido en .env).
- Tailwind v4 usa la propiedad CSS `translate` (no `transform`), por eso las transiciones del sidebar usan `transition-[width,translate]`.
- No existe endpoint de métricas: el Dashboard las deriva de `GET /admin/tecnicos` (conteo por estado en cliente) y `GET /admin/reportes?estado=pendiente` (`paginacion.total`). Si el backend añade un endpoint de métricas, migrar a él.
- Colores de estado (estados de verificación) vía tokens semánticos `success`/`warning`/`danger` en `@theme` (no hex en componentes).

## Pendiente del equipo
- [ ] URL del backend (local y producción) para el .env
- [x] **Resuelto (2026-10-16): login funcionando.** El `500` era porque las migraciones de Prisma no estaban aplicadas (`The table public.Usuario does not exist`); ya aplicadas y seedeado, el endpoint responde según `docs/ENDPOINTS_ADMIN.md` (`200` / `401`). **Credenciales admin locales que funcionan: `admin@trabajoya.com` / `123456`** (la variable `ADMIN_PASSWORD` del `.env` del backend tenía otro valor, pero el seed no lo aplicó; conviene revisarlo).
