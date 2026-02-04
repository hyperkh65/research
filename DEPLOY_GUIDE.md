# 🚀 마켓 스파이 배포 가이드

이 프로젝트는 브라우저 기반 크롤링을 수행하므로, **Koyeb** 또는 **Railway**와 같이 배포 환경에서 브라우저 실행을 지원하는 곳에 배포해야 합니다.

## 1. 깃허브 업로드
아래 명령어를 터미널에서 실행하여 코드를 업로드하세요. (미리 레포지토리를 만드셨다면 주소를 치환해주세요.)

```bash
git init
git add .
git commit -m "Initial commit: Supabase + Playwright Scraper"
git branch -M main
git remote add origin [본인의_깃허브_주소]
git push -u origin main
```

## 2. Koyeb.com 배포 방법 (추천)
1. **Koyeb** 가입 및 깃허브 연동
2. **Create Service** -> **GitHub** 선택 -> 이 레포지토리 선택
3. **Builder** 섹션에서 **Dockerfile**이 자동으로 인식됩니다.
4. **Environment Variables**에 다음 값을 반드시 추가하세요:
   - `NEXT_PUBLIC_SUPABASE_URL`: 본인의 Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 본인의 Supabase Anon Key
5. **Deploy** 버튼 클릭!

## 3. 주의사항
- Vercel 배포 시에는 브라우저 실행 시간 제한(10초)으로 인해 크롤링이 실패할 수 있습니다. 
- 가급적 Docker 환경을 지원하는 **Koyeb**을 사용하세요.
