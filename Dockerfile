# 단계 1: 프로젝트 빌드를 위한 베이스 이미지
FROM mcr.microsoft.com/playwright:v1.41.0-jammy AS builder

WORKDIR /app

# 종속성 파일 복사 및 설치
COPY package*.json ./
RUN npm install

# 소스 코드 복사 및 빌드
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# 단계 2: 실행을 위한 베이스 이미지
FROM mcr.microsoft.com/playwright:v1.41.0-jammy AS runner

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 필요한 파일만 빌더에서 복사
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# 스탠드얼론 출력물 복사 (.next/standalone가 생성되려면 next.config.mjs에 output: 'standalone' 필요)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 브라우저 실행을 위한 권한 설정 (필요 시)
# EXPOSE 3000

# 포트 설정
ENV PORT 3000
CMD ["node", "server.js"]
