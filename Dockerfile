# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY . .

# Build de la aplicación
RUN pnpm build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Instalar servidor HTTP simple
RUN npm install -g http-server

# Copiar dist desde builder
COPY --from=builder /app/dist ./dist

EXPOSE 5173

# Servir archivos estáticos
CMD ["http-server", "dist", "-p", "5173", "-g"]
