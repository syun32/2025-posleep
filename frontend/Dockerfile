# ========= 1) Build stage =========
FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# 1-1. deps layer만 먼저
COPY package.json package-lock.json ./
# npm 캐시를 BuildKit 캐시로
RUN --mount=type=cache,target=/root/.npm npm ci

# 1-2. 앱 소스 빌드 (Next 빌드 캐시 mount)
COPY . .
RUN --mount=type=cache,target=/app/.next/cache npm run build

# ========= 2) Runtime stage =========
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# 보안상 비루트
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Next standalone 산출물만 복사
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs
CMD ["node", "server.js"]
