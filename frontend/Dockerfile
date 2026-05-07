# Frontend Dockerfile - Vite + React
FROM node:20-bullseye-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --no-audit --prefer-offline

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM node:20-bullseye-slim

WORKDIR /app

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev --no-audit

EXPOSE 3000

# Use a simple static server (or Vite preview)
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]