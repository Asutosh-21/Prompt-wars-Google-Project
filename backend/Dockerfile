# ── Build stage ─────────────────────────────────────────────
FROM node:20-slim AS build
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

# ── Runtime stage ────────────────────────────────────────────
FROM node:20-slim
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY . .

# Cloud Run always injects PORT via env
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
