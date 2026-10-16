# AGENTS.md — Dashboard de administración de TrabajaYa

## Proyecto
Panel web interno para el equipo de TrabajaYa. Permite gestionar técnicos, verificaciones, reportes y métricas. No es público: solo accede el administrador.

**Framework:** React + Vite + TypeScript
**Estilos:** Tailwind CSS v4
**HTTP:** Axios con interceptor de token
**Estado global:** Context API (AuthContext)
**Backend:** http://localhost:3000 (desarrollo local)

## Paleta de colores
Definida en `src/index.css` con `@theme`:
```css
--color-primary: #1976D2;   /* azul principal */
--color-dark:    #071B36;   /* texto azul oscuro */
```
Úsalas en las clases de Tailwind como `bg-primary`, `text-dark`, etc.
No escribas colores hexadecimales directamente en los componentes.

## Estilos
- Tailwind CSS v4 instalado como plugin de Vite. Sin `tailwind.config.js`.
- Solo Tailwind. Sin librerías de UI (MUI, Ant Design, Chakra ni similares).
- Los componentes usan clases de Tailwind con los colores definidos en `@theme`.

## Backend
- URL base: `http://localhost:3000` en desarrollo. Leerla desde `.env` como `VITE_API_URL`.
- Todos los endpoints, cuerpos y respuestas están en `docs/ENDPOINTS_ADMIN.md`. Leerlo antes de conectar cualquier pantalla.
- El token JWT se guarda en `localStorage` con la clave `trabajaya_admin_token`.
- Axios tiene un interceptor que agrega `Authorization: Bearer <token>` en cada petición.
- Si el backend devuelve 401, limpiar el token y redirigir al login.
- **Antes de conectar cualquier pantalla a un endpoint**, hacer una llamada de prueba y mostrar la respuesta en consola. Confirmar que la estructura coincide con `docs/ENDPOINTS_ADMIN.md`. Si hay diferencia, avisar antes de continuar.

## Estructura
```
src/
  pages/        Una carpeta por pantalla (Login, Dashboard, Tecnicos, Reportes, etc.)
  components/   Componentes reutilizables (Sidebar, Header, Badge, Tabla, etc.)
  services/     api.ts (instancia de axios con interceptores)
  hooks/        useAuth.ts, useTecnicos.ts, useReportes.ts, etc.
  context/      AuthContext.tsx
docs/
  ENDPOINTS_ADMIN.md
  PROGRESS.md
AGENTS.md
.env                  (VITE_API_URL=http://localhost:3000)
.env.example          (VITE_API_URL=http://localhost:3000)
```
Todos los archivos son `.ts` o `.tsx`. Nunca `.js` ni `.jsx`.

## Reglas de trabajo
1. **Memoria:** al empezar cada sesión, leer `AGENTS.md` y `docs/PROGRESS.md`. Trabajar solo la tarea en curso. Al terminar, marcarla como hecha y dejar la siguiente como en curso. Actualizar `docs/PROGRESS.md` antes de terminar.
2. **Una tarea a la vez.** No adelantar tareas futuras ni refactorizar lo que no se pidió.
3. **Endpoints:** consultar siempre `docs/ENDPOINTS_ADMIN.md`. No inventar rutas ni estructuras de respuesta.
4. **Prueba de endpoints:** antes de construir la UI de una pantalla, hacer una llamada de prueba al endpoint correspondiente y mostrar la respuesta en consola. Si la estructura difiere del documento, avisar.
5. **Colores:** usar solo las variables de `@theme`. No escribir hexadecimales en los componentes.
6. **Sin librerías de UI.** Solo Tailwind.
7. **TypeScript siempre.** Todos los archivos son `.ts` o `.tsx`. No usar `any` salvo que sea inevitable, y en ese caso comentar por qué.
8. **Rutas protegidas:** cualquier ruta que no sea `/login` redirige al login si no hay token válido en `localStorage`.
9. **Errores:** mostrar mensajes de error en español, usando la respuesta del backend cuando exista.
10. **No inventar datos.** Si no hay respuesta del backend, mostrar un estado vacío o de carga. Nunca datos ficticios en producción.

## Cuándo preguntar
Preguntar siempre que:
- Una decisión de diseño o de flujo no esté clara.
- Una pantalla requiera datos que no están en `docs/ENDPOINTS_ADMIN.md`.
- Haya una diferencia entre la respuesta real del backend y lo que describe el documento.

## Seguridad
- El token va solo en `localStorage` y en el header de Axios. Nunca en la URL.
- No mostrar documentos ni selfies sin confirmar que el endpoint los entrega con URL firmada.
- El rol `admin` se verifica en el backend. El frontend decide qué mostrar, no qué está permitido.
- Las claves y secretos van solo en `.env`, que está en `.gitignore`. El `.env.example` no tiene valores reales.