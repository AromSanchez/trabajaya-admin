# PROGRESS — Dashboard de administración de TrabajaYa

> El agente lee este archivo al empezar y lo actualiza al terminar cada tarea.
> Solo una tarea puede estar "En curso" a la vez.

## En curso
- **T1 — Pantalla de login:** formulario que llama a `POST /auth/admin/login`, guarda token y usuario en localStorage y redirige al dashboard (`/dashboard`).

## Pendientes (en orden)
- [ ] T2 — Layout base: sidebar con navegación, header con nombre del admin y botón de cerrar sesión
- [ ] T3 — Dashboard: métricas generales (técnicos por estado, reportes abiertos) con datos reales del backend
- [ ] T4 — Lista de técnicos con filtro por estado de verificación (GET /admin/tecnicos)
- [ ] T5 — Detalle del técnico: perfil, documentos con visor y acciones (aprobar, observar, rechazar, suspender, reactivar)
- [ ] T6 — Lista de reportes con filtros (GET /admin/reportes) y detalle con resolución (PATCH /admin/reportes/:id)
- [ ] T7 — Reseñas: ocultar reseña desde el detalle del reporte (POST /admin/resenas/:id/ocultar)
- [ ] T8 — Cancelaciones tardías (GET /admin/cancelaciones-tardias)
- [ ] T9 — Pulido visual: responsive, estados de carga, errores y mensajes vacíos en todas las pantallas

## Hechas
- [x] **T0 — Configuración inicial** (2026-10-15): estructura de carpetas (`pages`, `components`, `services`, `hooks`, `context`), variables de color en `@theme` (`src/index.css`), `AuthContext` + `useAuth`, instancia de Axios con interceptores (`src/services/api.ts`), React Router con ruta de login y rutas protegidas (`ProtectedRoute`). `.env` / `.env.example` creados y `.env` ignorado por git. `npm run lint` y `npm run build` en verde; rutas verificadas en navegador.

## Notas y decisiones
- Paleta: #1976D2 azul principal, #071B36 texto oscuro, negro para texto general.
- Sin librerías de UI: solo CSS con variables.
- Token en localStorage con clave trabajaya_admin_token.
- El backend corre en VITE_API_URL (definido en .env).

## Pendiente del equipo
- [ ] URL del backend (local y producción) para el .env
