# Etapa de compilación
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa de producción
FROM node:20-alpine AS runner
WORKDIR /app

# ---- AQUÍ ESTABA EL ERROR: AGREGAR LA PALABRA 'ENV' ----
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --only=production

# Copiamos lo compilado de la etapa anterior
COPY --from=builder /app/dist ./dist

# Informar a Docker que la app usa el puerto 4621
EXPOSE 4621

CMD ["node", "dist/main"]
