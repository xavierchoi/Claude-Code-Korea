# Claude Code 한국 커뮤니티 개발 계획서

## 1. 프로젝트 개요

### 1.1 목적
Claude Code 한국 사용자들을 위한 지식 공유 커뮤니티 플랫폼 구축

### 1.2 핵심 기능
- 포럼/게시판 시스템
- 코드 공유 및 syntax highlighting
- Q&A 섹션
- 튜토리얼/문서 공유
- Claude Code 프로젝트 갤러리
- 댓글 및 실시간 알림
- Google/GitHub 소셜 로그인

### 1.3 대상 사용자
- 초기: 100명의 Claude Code 한국 사용자
- 1년 목표: 1,000명 이상

## 2. 기술 스택

### 2.1 프론트엔드
```yaml
Framework: SvelteKit
Styling: Tailwind CSS
UI Components: Skeleton UI
Code Editor: Monaco Editor
Syntax Highlighting: Shiki
Icons: Lucide Svelte
```

### 2.2 백엔드 (BaaS)
```yaml
Database: Supabase (PostgreSQL)
Authentication: Supabase Auth
Realtime: Supabase Realtime
File Storage: Supabase Storage
Edge Functions: Supabase Functions (필요시)
```

### 2.3 인프라
```yaml
Hosting: Vercel
CDN: Vercel Edge Network
Analytics: Vercel Analytics
Domain: TBD (예: claude-code-korea.com)
```

## 3. 데이터베이스 설계

### 3.1 테이블 구조

```sql
-- 사용자 프로필
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  github_username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 포럼 카테고리
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  order_index INT DEFAULT 0
);

-- 포럼 게시글
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 댓글
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 코드 스니펫
CREATE TABLE code_snippets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  tags TEXT[],
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 프로젝트
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  demo_url TEXT,
  github_url TEXT,
  thumbnail_url TEXT,
  tech_stack TEXT[],
  tags TEXT[],
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 좋아요
CREATE TABLE likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id),
  UNIQUE(user_id, project_id)
);

-- 알림
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'comment', 'like', 'mention', 'follow'
  title TEXT NOT NULL,
  content TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 팔로우
CREATE TABLE follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);
```

### 3.2 RLS (Row Level Security) 정책
```sql
-- 프로필은 누구나 읽을 수 있지만, 본인만 수정 가능
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 게시글은 누구나 읽을 수 있고, 로그인한 사용자만 작성 가능
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts are viewable by everyone"
  ON posts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = author_id);
```

## 4. 프로젝트 구조

```
claude-code-korea/
├── src/
│   ├── routes/
│   │   ├── +layout.svelte              # 전체 레이아웃
│   │   ├── +layout.server.js           # 서버사이드 레이아웃 로직
│   │   ├── +page.svelte                # 홈페이지
│   │   ├── +error.svelte               # 에러 페이지
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── +page.svelte        # 로그인 페이지
│   │   │   ├── register/
│   │   │   │   └── +page.svelte        # 회원가입 페이지
│   │   │   └── callback/
│   │   │       └── +page.svelte        # OAuth 콜백
│   │   ├── forum/
│   │   │   ├── +page.svelte            # 포럼 메인
│   │   │   ├── +page.server.js         # 게시글 목록 로드
│   │   │   ├── [category]/
│   │   │   │   └── +page.svelte        # 카테고리별 게시글
│   │   │   ├── post/
│   │   │   │   ├── new/
│   │   │   │   │   └── +page.svelte    # 새 게시글 작성
│   │   │   │   └── [id]/
│   │   │   │       ├── +page.svelte    # 게시글 상세
│   │   │   │       └── edit/
│   │   │   │           └── +page.svelte # 게시글 수정
│   │   ├── code/
│   │   │   ├── +page.svelte            # 코드 스니펫 목록
│   │   │   ├── new/
│   │   │   │   └── +page.svelte        # 새 코드 작성
│   │   │   └── [id]/
│   │   │       └── +page.svelte        # 코드 상세
│   │   ├── projects/
│   │   │   ├── +page.svelte            # 프로젝트 갤러리
│   │   │   ├── new/
│   │   │   │   └── +page.svelte        # 프로젝트 등록
│   │   │   └── [id]/
│   │   │       └── +page.svelte        # 프로젝트 상세
│   │   ├── users/
│   │   │   └── [username]/
│   │   │       ├── +page.svelte        # 사용자 프로필
│   │   │       └── +page.server.js
│   │   └── api/
│   │       ├── notifications/
│   │       │   └── +server.js          # 알림 API
│   │       └── upload/
│   │           └── +server.js          # 이미지 업로드 API
│   ├── lib/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.svelte       # 헤더
│   │   │   │   ├── Footer.svelte       # 푸터
│   │   │   │   └── Navigation.svelte   # 네비게이션
│   │   │   ├── forum/
│   │   │   │   ├── PostCard.svelte     # 게시글 카드
│   │   │   │   ├── PostList.svelte     # 게시글 목록
│   │   │   │   └── CategoryFilter.svelte
│   │   │   ├── comments/
│   │   │   │   ├── CommentList.svelte  # 댓글 목록
│   │   │   │   ├── CommentItem.svelte  # 댓글 아이템
│   │   │   │   └── CommentForm.svelte  # 댓글 작성 폼
│   │   │   ├── code/
│   │   │   │   ├── CodeEditor.svelte   # Monaco 에디터
│   │   │   │   └── CodeViewer.svelte   # 코드 뷰어
│   │   │   └── ui/
│   │   │       ├── Button.svelte       # 버튼 컴포넌트
│   │   │       ├── Card.svelte         # 카드 컴포넌트
│   │   │       └── Modal.svelte        # 모달 컴포넌트
│   │   ├── stores/
│   │   │   ├── user.js                 # 사용자 상태
│   │   │   ├── notifications.js        # 알림 상태
│   │   │   └── theme.js                # 테마 상태
│   │   ├── utils/
│   │   │   ├── supabase.js             # Supabase 클라이언트
│   │   │   ├── markdown.js             # 마크다운 파서
│   │   │   └── validators.js           # 유효성 검사
│   │   └── config/
│   │       └── constants.js            # 상수 정의
│   ├── hooks.server.js                 # 서버 훅
│   ├── hooks.client.js                 # 클라이언트 훅
│   ├── app.html                        # HTML 템플릿
│   └── app.css                         # 전역 스타일
├── static/
│   ├── favicon.png
│   └── robots.txt
├── tests/
│   └── unit/
├── .env.example                        # 환경변수 예제
├── .gitignore
├── package.json
├── svelte.config.js
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 5. API 설계

### 5.1 RESTful 엔드포인트

```typescript
// 게시글 API
GET    /api/posts              // 게시글 목록
GET    /api/posts/:id          // 게시글 상세
POST   /api/posts              // 게시글 작성
PUT    /api/posts/:id          // 게시글 수정
DELETE /api/posts/:id          // 게시글 삭제

// 댓글 API
GET    /api/posts/:id/comments // 댓글 목록
POST   /api/posts/:id/comments // 댓글 작성
PUT    /api/comments/:id       // 댓글 수정
DELETE /api/comments/:id       // 댓글 삭제

// 코드 스니펫 API
GET    /api/code               // 코드 목록
GET    /api/code/:id           // 코드 상세
POST   /api/code               // 코드 작성
PUT    /api/code/:id           // 코드 수정
DELETE /api/code/:id           // 코드 삭제

// 프로젝트 API
GET    /api/projects           // 프로젝트 목록
GET    /api/projects/:id       // 프로젝트 상세
POST   /api/projects           // 프로젝트 등록
PUT    /api/projects/:id       // 프로젝트 수정
DELETE /api/projects/:id       // 프로젝트 삭제

// 사용자 API
GET    /api/users/:username    // 사용자 프로필
PUT    /api/users/:id          // 프로필 수정
POST   /api/users/:id/follow   // 팔로우
DELETE /api/users/:id/follow   // 언팔로우

// 알림 API
GET    /api/notifications      // 알림 목록
PUT    /api/notifications/read // 알림 읽음 처리
```

### 5.2 실시간 구독

```javascript
// Supabase Realtime 구독
// 새 댓글 알림
supabase
  .channel('comments')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'comments',
    filter: `post_id=eq.${postId}`
  }, handleNewComment)
  .subscribe()

// 새 알림
supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, handleNewNotification)
  .subscribe()
```

## 6. UI/UX 가이드라인

### 6.1 디자인 시스템

```css
/* 색상 팔레트 */
--primary: #3B82F6;      /* 파란색 - 주요 액션 */
--secondary: #8B5CF6;    /* 보라색 - 보조 액션 */
--success: #10B981;      /* 초록색 - 성공 */
--warning: #F59E0B;      /* 주황색 - 경고 */
--error: #EF4444;        /* 빨간색 - 오류 */
--gray: #6B7280;         /* 회색 - 텍스트 */

/* 폰트 */
--font-sans: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'Fira Code', 'Courier New', monospace;

/* 간격 */
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
```

### 6.2 컴포넌트 스타일 가이드

```svelte
<!-- 버튼 예시 -->
<button class="
  px-4 py-2 
  bg-primary text-white 
  rounded-lg 
  hover:bg-primary-600 
  transition-colors
  disabled:opacity-50
">
  클릭하세요
</button>

<!-- 카드 예시 -->
<div class="
  bg-white dark:bg-gray-800 
  rounded-xl 
  shadow-lg 
  p-6
  border border-gray-200 dark:border-gray-700
">
  콘텐츠
</div>
```

### 6.3 반응형 디자인

```css
/* 브레이크포인트 */
sm: 640px   /* 모바일 */
md: 768px   /* 태블릿 */
lg: 1024px  /* 데스크톱 */
xl: 1280px  /* 와이드 */
```

## 7. 개발 환경 설정

### 7.1 환경 변수

```bash
# .env.local
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PUBLIC_SITE_URL=http://localhost:5173
```

### 7.2 개발 도구 설정

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[svelte]": {
    "editor.defaultFormatter": "svelte.svelte-vscode"
  }
}
```

### 7.3 Git 브랜치 전략

```
main          # 프로덕션 브랜치
├── develop   # 개발 브랜치
    ├── feature/auth          # 인증 기능
    ├── feature/forum         # 포럼 기능
    ├── feature/code-editor   # 코드 에디터
    └── feature/projects      # 프로젝트 갤러리
```

## 8. 보안 고려사항

### 8.1 인증 및 권한

- OAuth 2.0 (Google, GitHub)
- JWT 토큰 기반 인증
- RLS를 통한 데이터 접근 제어
- CSRF 토큰 사용

### 8.2 데이터 검증

```javascript
// 입력 검증 예시
const postSchema = {
  title: { 
    required: true, 
    minLength: 5, 
    maxLength: 100 
  },
  content: { 
    required: true, 
    minLength: 10, 
    maxLength: 10000 
  },
  tags: { 
    maxItems: 5, 
    itemMaxLength: 20 
  }
}
```

### 8.3 보안 헤더

```javascript
// hooks.server.js
export async function handle({ event, resolve }) {
  const response = await resolve(event);
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}
```

## 9. 성능 최적화

### 9.1 이미지 최적화

- WebP 포맷 사용
- 반응형 이미지
- Lazy loading
- CDN 활용

### 9.2 코드 최적화

- 코드 스플리팅
- 트리 쉐이킹
- 번들 크기 최적화
- 프리페칭

### 9.3 캐싱 전략

```javascript
// 정적 자산 캐싱
Cache-Control: public, max-age=31536000

// API 응답 캐싱
Cache-Control: private, max-age=3600
```

## 10. 배포 전략

### 10.1 CI/CD 파이프라인

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: vercel/action@v3
```

### 10.2 환경별 배포

- **개발**: feature 브랜치 → Vercel Preview
- **스테이징**: develop 브랜치 → staging.claude-code-korea.com
- **프로덕션**: main 브랜치 → claude-code-korea.com

## 11. 개발 로드맵

### Phase 1: 기초 구축 (1-2주)
- [x] 프로젝트 초기 설정
- [ ] Supabase 연동
- [ ] 인증 시스템 구현
- [ ] 기본 레이아웃 및 네비게이션

### Phase 2: 핵심 기능 (3-4주)
- [ ] 포럼 CRUD 기능
- [ ] 댓글 시스템
- [ ] 사용자 프로필
- [ ] 검색 기능

### Phase 3: 고급 기능 (5-6주)
- [ ] 코드 에디터 통합
- [ ] 코드 스니펫 공유
- [ ] 프로젝트 갤러리
- [ ] 실시간 알림

### Phase 4: 최적화 (7-8주)
- [ ] 성능 최적화
- [ ] SEO 최적화
- [ ] 접근성 개선
- [ ] 모바일 최적화

### Phase 5: 런칭 (9-10주)
- [ ] 베타 테스트
- [ ] 버그 수정
- [ ] 문서화
- [ ] 공식 런칭

## 12. 테스트 전략

### 12.1 단위 테스트

```javascript
// 컴포넌트 테스트 예시
import { render } from '@testing-library/svelte';
import PostCard from '$lib/components/forum/PostCard.svelte';

test('renders post title', () => {
  const { getByText } = render(PostCard, {
    props: {
      post: { title: '테스트 제목' }
    }
  });
  
  expect(getByText('테스트 제목')).toBeInTheDocument();
});
```

### 12.2 통합 테스트

- API 엔드포인트 테스트
- 데이터베이스 연동 테스트
- 인증 플로우 테스트

### 12.3 E2E 테스트

```javascript
// Playwright 테스트 예시
test('user can create a post', async ({ page }) => {
  await page.goto('/forum/post/new');
  await page.fill('[name="title"]', '새 게시글');
  await page.fill('[name="content"]', '게시글 내용');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL(/\/forum\/post\/\d+/);
});
```

## 13. 모니터링 및 분석

### 13.1 에러 모니터링

- Sentry 통합
- 에러 알림 설정
- 성능 모니터링

### 13.2 사용자 분석

- Vercel Analytics
- 사용자 행동 추적
- 성능 지표 모니터링

### 13.3 로그 관리

```javascript
// 구조화된 로깅
logger.info('User action', {
  userId: user.id,
  action: 'post_created',
  postId: post.id,
  timestamp: new Date()
});
```

## 14. 문서화

### 14.1 개발자 문서

- API 문서 (OpenAPI/Swagger)
- 컴포넌트 스토리북
- 아키텍처 다이어그램

### 14.2 사용자 가이드

- 사용자 매뉴얼
- FAQ
- 비디오 튜토리얼

## 15. 유지보수 계획

### 15.1 정기 업데이트

- 주간: 버그 수정
- 월간: 기능 개선
- 분기별: 주요 업데이트

### 15.2 백업 전략

- 일일 데이터베이스 백업
- 주간 전체 백업
- 재해 복구 계획

### 15.3 확장 계획

- 사용자 1,000명: 캐싱 레이어 추가
- 사용자 10,000명: 마이크로서비스 전환
- 글로벌 확장: 다중 리전 배포

---

이 문서는 Claude Code가 프로젝트를 이해하고 코드를 생성하는 데 필요한 모든 정보를 담고 있습니다. 각 섹션은 독립적으로 참조 가능하며, 개발 진행에 따라 업데이트됩니다.