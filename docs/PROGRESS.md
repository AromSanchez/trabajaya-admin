# PROGRESS — Dashboard de administración de TrabajaYa

> El agente lee este archivo al empezar y lo actualiza al terminar cada tarea.
> Solo una tarea puede estar "En curso" a la vez.

## En curso
- **T2 — Layout base:** sidebar con navegación, header con nombre del admin y botón de cerrar sesión.

## Pendientes (en orden)
- [ ] T3 — Dashboard: métricas generales (técnicos por estado, reportes abiertos) con datos reales del backend
- [ ] T4 — Lista de técnicos con filtro por estado de verificación (GET /admin/tecnicos)
- [ ] T5 — Detalle del técnico: perfil, documentos con visor y acciones (aprobar, observar, rechazar, suspender, reactivar)
- [ ] T6 — Lista de reportes con filtros (GET /admin/reportes) y detalle con resolución (PATCH /admin/reportes/:id)
- [ ] T7 — Reseñas: ocultar reseña desde el detalle del reporte (POST /admin/resenas/:id/ocultar)
- [ ] T8 — Cancelaciones tardías (GET /admin/cancelaciones-tardias)
- [ ] T9 — Pulido visual: responsive, estados de carga, errores y mensajes vacíos en todas las pantallas

## Hechas
- [x] **T0 — Configuración inicial** (2026-10-15): estructura de carpetas (`pages`, `components`, `services`, `hooks`, `context`), variables de color en `@theme` (`src/index.css`), `AuthContext` + `useAuth`, instancia de Axios con interceptores (`src/services/api.ts`), React Router con ruta de login y rutas protegidas (`ProtectedRoute`). `.env` / `.env.example` creados y `.env` ignorado por git. `npm run lint` y `npm run build` en verde; rutas verificadas en navegador.
- [x] **T1 — Pantalla de login** (2026-10-16): formulario (email + contraseña) en `src/pages/Login/Login.tsx`, servicio `loginAdmin` (`src/services/auth.ts`) que llama a `POST /auth/admin/login`, guarda token y usuario vía `AuthContext` y redirige a `/dashboard`. Si ya hay sesión, redirige al dashboard. Manejo de errores en español usando el mensaje del backend. `npm run lint` y `npm run build` en verde; verificado en navegador (el form llama al endpoint y muestra el error del backend cuando este falla).

## Notas y decisiones
- Paleta: #1976D2 azul principal, #071B36 texto oscuro, negro para texto general.
- Sin librerías de UI: solo CSS con variables.
- Token en localStorage con clave trabajaya_admin_token.
- El backend corre en VITE_API_URL (definido en .env).

## Pendiente del equipo
- [ ] URL del backend (local y producción) para el .env
- [ ] **Backend con error 500 en `POST /auth/admin/login`** (2026-10-16): con credenciales válidas, inválidas o incorrectas responde `500 {"error":"Error interno del servidor"}` en lugar de `200` / `401` según `docs/ENDPOINTS_ADMIN.md`. `GET /auth/perfil` sin token sí responde `401`, así que el servidor está arriba; parece un fallo de base de datos o falta de seed. Hay que resolverlo para poder probar el login de extremo a extremo.
