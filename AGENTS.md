# AGENTS.md — Dashboard de administración de TrabajaYa

## Proyecto
Panel web interno para el equipo de TrabajaYa. Permite gestionar técnicos, verificaciones, reportes y métricas. No es público: solo accede el administrador.

**Framework:** React + Vite + TypeScript
**Estilos:** Tailwind CSS v4
**HTTP:** Axios con interceptor de token
**Estado global:** Context API (AuthContext)
**Backend:** http://localhost:3000 (desarrollo local)

## Paleta de colores
Definida en `src/index.css` con `@theme`. Cada token tiene su valor en modo claro y su equivalente en modo oscuro (modo oscuro **definido pero no activado**: se activa añadiendo la clase `dark` al `<html>`; no hay toggle todavía).

**Marca y acciones**
| Token (`bg-*` / `text-*`) | Claro | Oscuro |
|---|---|---|
| `primary` (azul principal) | `#0080FF` | `#0080FF` |
| `primary-strong` (botón con texto blanco) | `#0070E6` | `#0070E6` |
| `primary-hover` (hover de botón) | `#0062C9` | `#1A85F0` |
| `link` (texto y enlaces) | `#0062C9` | `#6DB4FF` |
| `primary-soft` (fondos suaves) | `#E5F1FF` | `#0F2B4F` |

**Neutros**
| Token | Claro | Oscuro |
|---|---|---|
| `base` (fondo de página) | `#F3F6FB` | `#08131F` |
| `surface` (tarjetas) | `#FFFFFF` | `#0E1D2F` |
| `surface-2` (superficie secundaria) | `#F7F9FD` | `#132740` |
| `line` (bordes) | `#E1E8F2` | `#1F3550` |
| `line-strong` (bordes marcados) | `#C9D6E6` | `#2B4766` |
| `ink` (texto principal) | `#0A1F3A` | `#E6EEF8` |
| `ink-2` (texto secundario) | `#3F5775` | `#A8BCD3` |
| `ink-3` (texto de apoyo) | `#566D88` | `#8097B2` |

**Estados** (cada uno con base, `-text` y `-soft`)
| Estado | base | texto | suave |
|---|---|---|---|
| `success` / Verificado | `#1F9D6A` | `#17724C` | `#E0F4EA` |
| `danger` / Rechazado | `#D14646` | `#B02F2F` | `#FBE6E6` |
| `warning` / Observado | `#E5702A` | `#9A4A10` | `#FDEEE0` |
| `revision` / En revisión | `#4F6BED` | — | — |
| `pending` / Pendiente y `suspended` / Suspendido | `#8A9BB0` / `#3F4F63` | — | — |

**Gráficos:** `chart-1` (registros) `#0080FF` · `chart-2` (verificados) `#2A4A73` (oscuro `#9FB8D6`).

Úsalos en las clases de Tailwind (`bg-primary-strong`, `text-ink-2`, `border-line`, etc.).
No escribas colores hexadecimales directamente en los componentes.

## Tipografías
- Títulos y cifras: **Sora** → clase `font-display`.
- Texto: **Manrope** → fuente por defecto (`font-sans` / `body`).
- Se cargan vía Google Fonts en `index.html`.

## Estilos
- Tailwind CSS v4 instalado como plugin de Vite. Sin `tailwind.config.js`.
- Solo Tailwind. Sin librerías de UI (MUI, Ant Design, Chakra ni similares).
- Los componentes usan clases de Tailwind con los colores definidos en `@theme`.
- Radios suaves (`rounded-md`/`rounded-lg`), sombras sutiles (`shadow-sm`/`shadow-md`) y tipografía Sora/Manrope. La jerarquía visual se apoya en color, tamaño y espacio (principios de neurociencia: saliencia, agrupación y baja carga cognitiva).

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