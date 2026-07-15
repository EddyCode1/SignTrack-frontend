# SignTrack Frontend — develop

App React (Vite) para la plataforma Teams inclusiva SignTrack.

**Backend:** repo `Gappy99/SignTrack`, rama `develop`, Identity en `:5104`.

## Inicio rápido

```bash
git checkout develop
pnpm install
cp .env.example .env.development   # o crear manualmente
pnpm dev
```

Abre `http://localhost:5173`. El proxy envía `/api` al backend Identity.

## Backend en paralelo

Ver [SignTrack/docs/FRONTEND_INTEGRATION.md](https://github.com/Gappy99/SignTrack/blob/develop/docs/FRONTEND_INTEGRATION.md)

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
| `/login` | Inicio de sesión |
| `/register` | Registro |
| `/dashboard` | Panel (auth) |
| `/dashboard/users` | Usuarios (admin) |
| `/dashboard/profile` | Perfil |

## Estructura

```
src/
├── app/           # Router, layouts, shell Teams
├── features/      # auth, dashboard, users
└── shared/        # api clients, stores, components
```
