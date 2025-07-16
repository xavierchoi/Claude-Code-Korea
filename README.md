# Claude Code Korea 🇰🇷

한국 Claude 개발자들을 위한 커뮤니티 플랫폼

## 🚀 기술 스택

- **Frontend**: SvelteKit, TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **Database**: PostgreSQL with Row Level Security
- **Authentication**: OAuth (Google, GitHub)
- **Styling**: Tailwind CSS with Typography & Forms plugins
- **File Upload**: Supabase Storage

## ✨ 주요 기능

- 🔐 **OAuth 소셜 로그인** - Google, GitHub 로그인 지원
- 👤 **사용자 프로필 관리** - 프로필 정보 수정 및 이미지 업로드
- 🛡️ **보안 강화된 인증 시스템** - Row Level Security 적용
- 📱 **반응형 디자인** - 모바일 친화적 UI/UX
- ⚡ **실시간 세션 동기화** - 서버-클라이언트 세션 상태 관리
- 🔍 **사용자명 중복 검사** - 실시간 유효성 검증

## 🛠️ 개발 환경 설정

### 필수 요구사항
- Node.js 18+ 
- npm 또는 pnpm
- Supabase 계정

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone https://github.com/your-username/claude-code-korea.git
   cd claude-code-korea
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **환경 변수 설정**
   ```bash
   cp .env.example .env
   ```
   
   `.env` 파일에 다음 값들을 설정하세요:
   ```env
   PUBLIC_SUPABASE_URL=your_supabase_project_url
   PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **개발 서버 실행**
   ```bash
   npm run dev
   ```

5. **브라우저에서 확인**
   ```
   http://localhost:5173
   ```

## 🗄️ 데이터베이스 설정

### Supabase 설정
1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. Authentication → Providers에서 Google, GitHub OAuth 설정
3. 다음 SQL을 실행하여 프로필 테이블 생성:

```sql
-- 프로필 테이블 생성
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  location TEXT,
  github_username TEXT,
  twitter_username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 정책 생성
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);
```

4. Storage에서 `avatars` 버킷 생성 및 정책 설정

## 📁 프로젝트 구조

```
claude-code-korea/
├── src/
│   ├── lib/
│   │   ├── server/
│   │   │   ├── supabase.ts      # 서버사이드 Supabase 클라이언트
│   │   │   └── auth.ts          # 인증 유틸리티
│   │   └── supabase.ts          # 클라이언트사이드 Supabase 클라이언트
│   ├── routes/
│   │   ├── api/
│   │   │   ├── auth/            # 인증 API
│   │   │   └── profile/         # 프로필 API
│   │   ├── auth/                # 인증 페이지
│   │   ├── profile/             # 프로필 관리 페이지
│   │   ├── +layout.svelte       # 전역 레이아웃
│   │   └── +page.svelte         # 홈페이지
│   ├── app.html
│   ├── app.css
│   └── hooks.server.ts          # 서버 훅
├── static/
├── .env.example
├── package.json
└── README.md
```

## 🔧 주요 스크립트

```bash
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm run preview      # 빌드 미리보기
npm run check        # TypeScript 타입 체크
npm run lint         # ESLint 실행
npm run format       # Prettier 포맷팅
```

## 🚀 배포

### Vercel 배포
1. GitHub 레포지토리를 Vercel에 연결
2. 환경 변수 설정
3. 자동 배포 완료

### 환경 변수 (프로덕션)
```env
PUBLIC_SUPABASE_URL=your_production_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 연락처

프로젝트 링크: [https://github.com/your-username/claude-code-korea](https://github.com/your-username/claude-code-korea)

---

**Claude Code Korea** - 한국 개발자들을 위한 AI 기반 개발 커뮤니티 🚀