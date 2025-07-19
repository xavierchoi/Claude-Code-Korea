# 변경 이력

이 프로젝트의 모든 주요 변경사항이 이 파일에 기록됩니다.

형식은 [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)를 기반으로 하며,
이 프로젝트는 [Semantic Versioning](https://semver.org/spec/v2.0.0.html)을 따릅니다.

## [출시 예정]

## [1.6.3] - 2025-07-19

### 수정됨
- 관리자 자기 댓글 삭제 버그 수정
  - 관리자도 RLS 정책의 영향을 받아 자신의 댓글 삭제 불가 문제
  - 관리자는 항상 admin_delete_comment RPC 사용하도록 변경
- 인증 시스템 트리거 오류 수정
  - "relation 'profiles' does not exist" 오류 해결
  - 트리거에 포괄적 에러 처리 및 search_path 명시
  - 인증 프로세스가 프로필 생성 실패 시에도 중단되지 않도록 개선
- 관리자 댓글 삭제 권한 RLS 정책 수정
  - UPDATE 정책에 WITH CHECK 절 추가
  - 관리자 전용 소프트 삭제 정책 추가
  - INSERT 정책에서 is_deleted 제약 제거
  - RLS 문제 해결을 위해 admin_delete_comment RPC 함수 추가

### 추가됨
- 토스트 알림 시스템 구현
  - 댓글 작성/수정/삭제 시 성공/실패 알림 표시
  - 우측 상단에 슬라이드 애니메이션으로 표시
  - 3초 후 자동 사라짐, 수동 닫기 가능
  - 성공/오류/정보 타입별 스타일링
- 댓글 작성 후 자동 스크롤 및 하이라이트
  - 새 댓글/답글 작성 시 해당 위치로 부드러운 스크롤
  - 2초간 노란색 하이라이트 효과로 시각적 피드백
  - scroll-margin-top으로 헤더와 겹치지 않도록 처리
- 키보드 단축키로 댓글 작성/수정
  - Windows: Ctrl + Enter
  - macOS: Cmd + Enter
  - 댓글 작성, 답글 작성, 댓글 수정 모두 지원

### 기술적 개선
- 트리거 안정성 대폭 향상 (handle_new_user, sync_user_admin_status)
- RLS 정책 완전성 개선 (USING과 WITH CHECK 모두 구현)
- 댓글 삭제 후 invalidateAll()로 부드러운 데이터 새로고침

## [1.6.2] - 2025-07-19

### 추가됨
- 관리자 댓글 관리 권한 강화
  - 관리자는 모든 사용자의 댓글을 수정 및 삭제 가능
  - API 엔드포인트 레벨에서 관리자 권한 체크 구현
  - 소프트 삭제(soft delete) 기능 추가 (is_deleted, deleted_at 필드)
  - 삭제된 댓글은 RLS 정책에 의해 자동으로 필터링

### 기술적 개선
- 댓글 API 엔드포인트 추가 (/api/comments/[id])
  - PUT: 댓글 수정 (작성자 또는 관리자만 가능)
  - DELETE: 댓글 삭제 (작성자 또는 관리자만 가능)
- 댓글 테이블에 소프트 삭제 컬럼 추가
- RLS 정책 업데이트로 삭제된 댓글 자동 필터링
- hooks.server.ts에 authHandle 추가하여 locals.user 설정
- app.d.ts에 locals.user 타입 정의 추가
- profiles 테이블에 is_admin 컬럼 추가
  - user_metadata.role과 자동 동기화되는 트리거 추가
  - 관리자 권한 체크를 위한 인덱스 추가

### 수정됨
- API 라우트 충돌 해결 ([comment_id] → [id])
- 테스트 파일을 새로운 API 구조에 맞게 업데이트
- 프로필 사진 로딩 오류 수정
  - Supabase Storage avatars 버킷을 public으로 설정
  - 이미지 로드 실패 시 대체 이미지 표시 로직 개선
  - URL 인코딩 처리 추가
- Svelte 5 이벤트 핸들러 문법 오류 수정
  - on:error를 onerror로 변경 (새로운 문법 적용)
- 관리자 댓글 삭제 권한 문제 수정
  - RLS UPDATE 정책에 관리자 권한 추가
  - 소프트 삭제 시 실시간 업데이트로 화면에서 즉시 제거
  - 디버깅 로그 추가로 문제 진단 개선

## [1.6.1] - 2025-07-19

### 수정됨
- 실시간 댓글 업데이트 문제 해결
  - Supabase Realtime Publication 설정 누락 문제 수정
  - comments, posts, likes, follows, notifications 테이블을 supabase_realtime publication에 추가
  - 댓글 작성 후 실시간 반영이 정상적으로 작동하도록 수정
  - 중복 댓글 방지 로직 추가
  - 실시간 구독 상태 로깅 개선

### 기술적 개선
- 실시간 댓글 시스템 안정성 향상
- Supabase Realtime 설정 마이그레이션 파일 추가
- 디버깅을 위한 상세 로깅 추가
- Svelte 5 호환성 개선 (이벤트 핸들러, $state 사용)

## [1.6.0] - 2025-07-19

### 추가됨
- 실시간 댓글 시스템 구현 (Phase 6.2 완료)
  - Supabase Realtime을 통한 댓글 실시간 동기화
  - 새 댓글 작성 시 페이지 새로고침 없이 즉시 표시
  - 댓글 수정/삭제 시 모든 사용자 화면에 실시간 반영
  - 댓글 개수 실시간 업데이트
- 관리자 권한 댓글 관리 기능
  - 관리자는 모든 댓글 수정/삭제 가능
  - user_metadata.role === 'admin' 체크
  - 프론트엔드 UI에서도 관리자 권한 표시
- 실시간 댓글 데모 페이지 (/demo/realtime-comments)

### 수정됨
- marked.js 렌더러 함수 시그니처 업데이트 (객체 구조 분해 방식)
- 계층형 댓글 구조 빌드 최적화 및 안정성 향상
- 초기 댓글 로드 로직 개선 (계층/플랫 구조 자동 감지)
- 실시간 댓글 업데이트 안정성 및 성능 향상

### 기술적 개선
- commentStore 구현: Svelte store를 통한 실시간 상태 관리
- useRealtimeComments 훅: Supabase 실시간 구독 관리
- Supabase 클라이언트를 Svelte context로 제공
- 실시간 업데이트 시 자동으로 작성자 정보 포함
- 댓글 store 유닛 테스트 추가
- 대댓글 표시 문제 해결 및 디버깅 로그 정리

## [1.5.0] - 2025-07-18

### 추가됨
- 계층형 댓글 시스템 구현 (Phase 6.1 완료)
  - 댓글 및 대댓글 CRUD API 구현 (작성, 조회, 수정, 삭제)
  - 계층형 댓글 트리 구조 지원 (parent_id를 통한 무한 depth)
  - 댓글 작성자 정보 표시 (아바타, 사용자명)
  - 댓글 인라인 수정 기능
  - 댓글 삭제 시 확인 메시지
  - 실시간 댓글 개수 업데이트 (대댓글 포함)
- CommentList 컴포넌트: 댓글 목록 표시 및 작성
- CommentItem 컴포넌트: 개별 댓글 렌더링, 답글, 수정, 삭제 기능
- 댓글 작성 시 로그인 여부 체크
- 더미 댓글 데이터 생성 (총 17개, 3단계 depth까지)

### 변경됨
- 게시물 상세 페이지에 댓글 시스템 통합
- 게시물 잠김 상태일 때 댓글 작성 차단
- 댓글 개수 계산 로직 개선 (모든 계층 포함)

### 기술적 개선
- TDD 방식으로 댓글 API 개발
- 댓글 트리 구조 재귀 알고리즘 구현
- TypeScript 타입 정의 추가 (Comment, CommentWithAuthor, CommentWithReplies)
- Profile 타입 정의 추가
- PUT /api/comments/[comment_id] - 댓글 수정 API
- DELETE /api/comments/[comment_id] - 댓글 삭제 API

## [1.4.0] - 2025-07-18

### 추가됨
- 포럼 시스템과 한국형 게시판 통합 시작
- 실제 데이터베이스 연동 (Supabase posts/categories 테이블)
- 서버사이드 페이지네이션 지원

### 변경됨
- 더미 데이터 작성자를 xavierchoi와 hunmintest로 통일
- 메인 페이지에서 실제 게시물 데이터 표시
- 글쓰기 버튼이 기존 /posts/new 라우트 활용

### 기술적 개선
- 데이터베이스 스키마 재사용으로 중복 제거
- 서버/클라이언트 데이터 동기화 개선

## [1.3.0] - 2025-07-18

### 추가됨
- 한국형 게시판 UI 시스템 구현
  - BoardList 컴포넌트: 전통적인 테이블 형식의 게시물 목록
  - BoardHeader 컴포넌트: 카테고리 선택, 검색, 통계 표시
  - BoardSidebar 컴포넌트: 인기 게시물, 최근 댓글, 활동 랭킹
- 게시판 기능 추가
  - 고정 게시물 (핀 아이콘)
  - 인기 게시물 (불꽃 아이콘)
  - 새 게시물 배지 (24시간 이내)
  - 첨부파일 표시 기능
  - 계층적 답글 구조 (들여쓰기)
- 사용자 레벨 시스템 도입
  - 레벨별 색상 차별화
  - 포인트 기반 랭킹 시스템

### 변경됨
- 메인 페이지를 게시판 중심으로 재설계
- 한국 커뮤니티 스타일의 정보 밀도 높은 레이아웃
- 전통적인 페이지네이션 방식 적용 (무한 스크롤 대신)

### 기술적 개선
- SSR 호환성 개선 (date-fns 제거, 서버사이드 데이터 생성)
- Svelte 5 이벤트 핸들러 마이그레이션 (on: → on 문법)
- Svelte 5 Runes 모드 적용 ($: → $derived)
- 반응형 디자인 최적화 (모바일/태블릿/데스크톱)
- Hydration 불일치 문제 해결

## [1.2.1] - 2025-07-18

### 추가됨
- 파비콘 추가 (favicon.ico → favicon.svg로 최종 설정)
- 프로젝트 관리 가이드라인 추가 (CLAUDE.md)
- 업데이트 로그 작성 가이드라인 추가

### 변경됨
- CHANGELOG.md 전체 한글 번역 완료
- 섹션 제목 한국어화 (추가됨, 변경됨, 수정됨, 기술적 개선)
- 프로젝트 문서화 품질 향상

### 기술적 개선
- 체계적인 변경 이력 관리 시스템 구축
- 버전 관리 규칙 정립 (Major/Minor/Patch)
- 커밋 체크리스트 도입으로 품질 관리 강화

## [1.2.0] - 2025-07-18

### 추가됨
- Anthropic 브랜드 색상 팔레트 전체 적용
- 커스텀 커뮤니티 로고 (`cckorea.svg`) 추가
- 글쓰기 버튼을 pencil-square 아이콘으로 변경
- 심리스 헤더 디자인 (배경 투명, 테두리 제거)
- Tailwind CSS v4 호환 색상 시스템 구현

### 변경됨
- 헤더 로고 크기 최적화 (h-6, 24px)
- 전체 네비게이션 색상을 primary/accent 시스템으로 업데이트
- 글쓰기 버튼 동작 최적화 (직접 네비게이션 방식)

### 수정됨
- Supabase 클라이언트 쿼리 무한 대기 문제 해결
- RLS 정책 최적화로 데이터베이스 접근 안정성 향상
- 모바일 메뉴 색상 일관성 개선

### 기술적 개선
- `@theme` 블록을 CSS 사용자 정의 속성으로 변경
- Profile store의 hasUsername 함수 개선
- 프로덕션 레디 수준의 에러 처리 구현

## [1.1.0] - 2025-07-16

### 추가됨
- 완전한 프로필 관리 시스템 구현
- 포럼 시스템 구현 및 관리자 기능 추가
- 프로필 설정 UX 개선 및 데이터베이스 구조 구현
- 인증 상태 관리 및 보호된 라우트 구현
- 기본 레이아웃 및 네비게이션 구현

### 기술적 개선
- SvelteKit + Supabase 인증 시스템 구축
- Row Level Security (RLS) 정책 구현
- TypeScript 엄격 모드 적용
- Tailwind CSS v4 설정