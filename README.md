# SignTrack Frontend — ft/sajche

App React (Vite) para la plataforma Teams inclusiva SignTrack.

**Backend:** repo `Gappy99/SignTrack`, rama `ft/sajche`, Identity en `:5104`.

## Inicio rápido

```bash
git checkout ft/sajche
pnpm install
cp .env.example .env.development   # o crear manualmente
pnpm dev
```

### Todo en uno (backend + frontend)

Con ambos repos en la misma carpeta (`SignTrack` y `SignTrack-frontend`):

```bash
# Desde frontend o backend (instala deps del frontend si faltan)
pnpm start:all
```

Si falla con `vite no se reconoce`, instala manualmente una vez:

```bash
cd SignTrack-frontend && pnpm install
```

Si Identity dice que el `.dll` está bloqueado, hay otra instancia corriendo. Cierra la terminal anterior o:

```powershell
taskkill /PID <pid> /T /F   # pid de netstat en :5104
```

Levanta Docker (Postgres/Redis), Identity en `:5104` y Vite en `:5180`.

Abre **`http://localhost:5180/signtrack/`** → redirige al login. El proxy envía `/api` al backend Identity.

### Credenciales dev (backend Identity)

Tras `pnpm start:all` y migraciones:

| Usuario | Contraseña |
|---------|------------|
| `admin@SignTrack.com` | `Admin1234!` |

Registra usuarios nuevos en `/signtrack/register`.

### Modo rápido (sin login) — opcional

Solo para maquetar UI sin backend. En `.env.development`:

```env
VITE_AUTH_DISABLED=true
```

- Entras directo al dashboard con usuario mock admin
- Barra amarilla indica que auth está apagado
- Datos de listas/perfil son mock; no requiere backend corriendo
- **Producción:** nunca activar (`VITE_AUTH_DISABLED=false` o omitir)

Para probar login real de nuevo: `VITE_AUTH_DISABLED=false` y reinicia `pnpm dev`.

## Backend en paralelo

Ver [SignTrack/docs/FRONTEND_INTEGRATION.md](https://github.com/Gappy99/SignTrack/blob/ft/sajche/docs/FRONTEND_INTEGRATION.md)

```bash
# En repo SignTrack
docker compose up -d
cd services/identity/SignTrack.Identity.Api
dotnet user-secrets set "JwtSettings:SecretKey" "SignTrackDevSecretKeyMin32Chars!!"
dotnet run
```

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/signtrack/login` | Inicio de sesión |
| `/signtrack/register` | Registro |
| `/signtrack/dashboard` | Panel (auth) |
| `/signtrack/dashboard/users` | Usuarios (admin) |
| `/signtrack/dashboard/profile` | Perfil |

## Estructura

```
src/
├── app/           # Router, layouts, shell Teams
├── features/      # auth, dashboard, users
└── shared/        # api clients, stores, components
```
