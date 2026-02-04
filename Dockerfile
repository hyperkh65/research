FROM mcr.microsoft.com/playwright:v1.41.0-jammy

# 앱 디렉토리 설정
WORKDIR /app

# 종속성 설치를 위해 package.json 복사
COPY package*.json ./

# 앱 종속성 설치
RUN npm install

# Playwright 브라우저 바이너리 설치
RUN npx playwright install chromium --with-deps

# 소스 코드 복사
COPY . .

# Next.js 빌드 (서버리스가 아닌 스탠드얼론 모드 권장)
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# 포트 설정
EXPOSE 3000

# 앱 실행
CMD ["npm", "start"]
