# ==============================================================================
# OpsPilot AI — Production Dockerfile for Google Cloud Run
# ==============================================================================

# Build & Runtime Base Image
FROM node:20-slim AS builder

WORKDIR /app

# Install dependencies (including devDependencies needed for build)
COPY package*.json ./
RUN npm ci

# Copy application source code
COPY . .

# Build Vite frontend assets and bundle Express backend server
ENV NODE_ENV=production
RUN npm run build

# Prune dev dependencies for lean production container
RUN npm prune --production

# ------------------------------------------------------------------------------
# Production Image
# ------------------------------------------------------------------------------
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy node_modules, compiled server, and built frontend static assets
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/firebase-applet-config.json* ./

# Bind to Cloud Run container port
EXPOSE 3000

# Start production server
CMD ["node", "dist/server.cjs"]
