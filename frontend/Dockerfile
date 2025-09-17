# ========= 1) Build stage =========
FROM node:20-alpine AS builder
WORKDIR /app

# 패키지 파일만 먼저 복사 → 의존성 캐시
COPY package*.json ./
RUN npm ci

# 앱 소스 복사 & 빌드
COPY . .
# 프로덕션 빌드 (standalone 산출물 생성)
RUN npm run build

# ========= 2) Runtime stage =========
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# 보안상 node 유저 사용
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# standalone 서버 코드 & 정적 리소스 복사
# (Next.js standalone 구조 기준)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# 런타임에 env로 API base url 등을 주입하고 싶으면 docker-compose에서 환경변수로 넘기면 됨.
USER nextjs
CMD ["node", "server.js"]
