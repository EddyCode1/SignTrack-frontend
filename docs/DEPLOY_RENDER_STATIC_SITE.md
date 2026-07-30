# Deploy permanente del frontend en Render (Static Site)

Complemento de `docs/DEPLOY_RENDER_PERMANENTE.md` del repo backend
(`SignTrack`). Esto crea la URL fija donde vive la app web, siempre
disponible, sin depender de ninguna computadora encendida.

Requisito previo: haber creado ya los 3 servicios del backend en Render
(Identity, Messaging, Gateway) — necesitas sus URLs para el paso 3.

## Paso 1 — Crear el Static Site en Render

1. En el dashboard de Render (misma cuenta del backend): **New** → **Static Site**.
2. Elige el repo `EddyCode1/SignTrack-frontend`, rama **develop**.
3. Configuración de build:
   - **Build Command:** `pnpm install && pnpm build`
   - **Publish directory:** `dist`

## Paso 2 — Rewrite rule (para que las rutas de React funcionen al refrescar)

En la sección "Redirects/Rewrites" del Static Site, agrega una regla:

- **Source:** `/*`
- **Destination:** `/index.html`
- **Action:** Rewrite

Sin esto, refrescar la página en una ruta interna (ej. `/dashboard/chats`)
da error 404.

## Paso 3 — Variables de entorno (build-time)

En "Environment" del Static Site, agrega estas variables usando las URLs
públicas reales que Render le asignó a cada servicio del backend
(algo como `https://signtrack-gateway.onrender.com`):

| Variable | Valor |
|---|---|
| `VITE_API_URL` | `https://signtrack-gateway.onrender.com/api/v1` |
| `VITE_IDENTITY_URL` | `https://signtrack-gateway.onrender.com/api/v1` |
| `VITE_AUTH_URL` | `https://signtrack-gateway.onrender.com/api/v1/auth` |
| `VITE_CHAT_HUB_URL` | `https://signtrack-gateway.onrender.com/hubs/chat` |
| `VITE_AUTH_DISABLED` | `false` |

No hace falta configurar `VITE_CALLS_HUB_URL` ni `VITE_RECOGNITION_URL` —
esos servicios (Calls, Recognition) no están desplegados aquí a propósito;
las pantallas de Llamadas se ven pero no van a conectar, eso es esperado.

Después de guardar las variables, Render vuelve a compilar el sitio solo.

## Paso 4 — Cerrar el círculo con el backend

Con esta URL del Static Site ya asignada (ej.
`https://signtrack-web.onrender.com`), vuelve al repo backend y sigue el
Paso 5 de `DEPLOY_RENDER_PERMANENTE.md`: pegar esta URL en
`Security__AllowedOrigins__0` y `AppSettings__FrontendUrl` de
signtrack-identity, y en `CORS_ORIGINS` de signtrack-gateway.

## Verificación

Abre la URL del Static Site → debe cargar el login → inicia sesión → debes
llegar al dashboard y poder usar Chats/Contactos con normalidad.
