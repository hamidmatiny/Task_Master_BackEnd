# frontend/Dockerfile
FROM node:20-bullseye-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit

COPY . .
RUN npm run build

# Production image
FROM node:20-bullseye-slim

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000", "--no-clipboard"]