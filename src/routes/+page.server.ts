import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { safeGetSession, supabase }, depends, url }) => {
  depends('supabase:auth')
  
  const { session, user } = await safeGetSession()

  // Only pass safe user data to avoid security warnings
  const safeSession = session ? {
    ...session,
    user: user // This user is validated via getUser()
  } : null
  
  // 실제 데이터베이스에서 게시물 가져오기
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = 20
  const offset = (page - 1) * limit
  
  // 게시물 조회
  const { data: posts, error: postsError, count } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey (
        id,
        username,
        full_name,
        avatar_url
      ),
      category:categories!posts_category_id_fkey (
        id,
        name,
        slug,
        icon,
        color
      )
    `, { count: 'exact' })
    .eq('is_published', true)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  // 게시물이 없거나 에러가 있으면 더미 데이터 사용
  const finalPosts = (!posts || posts.length === 0) ? generateDummyPosts() : posts.map(post => ({
    ...post,
    author: {
      username: post.author?.username || 'anonymous',
      display_name: post.author?.full_name || post.author?.username || 'Anonymous',
      level: Math.floor(Math.random() * 10) + 1
    },
    category: {
      name: post.category?.name || '일반',
      color: post.category?.color || '#6b7280',
      slug: post.category?.slug || 'general'
    },
    is_new: new Date(post.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000,
    is_hot: post.like_count > 50 || post.comment_count > 20,
    has_attachment: false,
    replies: []
  }))
  
  // 카테고리 데이터 가져오기
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('position', { ascending: true })
  
  const categories = categoriesData?.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    postCount: 0 // TODO: 실제 게시물 수 계산
  })) || []
  
  // 사이드바 데이터
  const popularPosts = [
    { id: '1', title: 'Claude API로 나만의 AI 비서 만들기', commentCount: 23, likeCount: 67, author: 'hunmintest' },
    { id: '2', title: 'SvelteKit + Claude 완벽 가이드', commentCount: 18, likeCount: 45 },
    { id: '3', title: '프롬프트 엔지니어링 베스트 프랙티스', commentCount: 15, likeCount: 38 },
    { id: '4', title: 'Claude vs GPT-4 성능 비교', commentCount: 12, likeCount: 29 },
    { id: '5', title: 'AI 개발자가 되는 방법', commentCount: 10, likeCount: 25 }
  ]
  
  const recentComments = [
    { id: '1', postId: '1', postTitle: 'Claude API 연동 방법', content: '정말 도움이 되었습니다! 감사합니다.', authorName: 'Xavier Choi', createdAt: '5분 전' },
    { id: '2', postId: '2', postTitle: 'SvelteKit 질문', content: '저도 같은 문제가 있었는데 이렇게 해결했습니다...', authorName: 'Hunmin Test', createdAt: '12분 전' },
    { id: '3', postId: '3', postTitle: '프롬프트 팁', content: '좋은 정보 감사합니다!', authorName: 'Xavier Choi', createdAt: '30분 전' },
    { id: '4', postId: '4', postTitle: 'AI 프로젝트 공유', content: '대단하네요! 저도 한번 만들어보고 싶어요.', authorName: 'Hunmin Test', createdAt: '1시간 전' },
    { id: '5', postId: '5', postTitle: '오류 해결 방법', content: '덕분에 해결했습니다. 감사해요!', authorName: 'Xavier Choi', createdAt: '2시간 전' }
  ]
  
  const topUsers = [
    { id: '1', username: 'xavierchoi', displayName: 'Xavier Choi', level: 10, points: 12580, rank: 1 },
    { id: '2', username: 'hunmintest', displayName: 'Hunmin Test', level: 8, points: 10230, rank: 2 }
  ]
  
  const announcement = {
    title: 'Claude Code Korea 커뮤니티 규칙 안내',
    content: '건전한 커뮤니티 문화를 위해 규칙을 준수해주세요.'
  }
  
  const rules = [
    '서로 존중하며 예의를 지켜주세요',
    '광고성 게시물은 금지됩니다',
    '코드는 코드블록을 사용해주세요',
    '중복 질문 전 검색을 해주세요',
    '개인정보 노출에 주의해주세요'
  ]
  
  const totalPages = Math.ceil((count || 0) / limit)
  
  return {
    session: safeSession,
    posts: finalPosts,
    categories,
    popularPosts,
    recentComments,
    topUsers,
    announcement,
    rules,
    pagination: {
      page,
      limit,
      totalCount: count || 0,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  }
}

// 더미 게시물 데이터 생성 함수
function generateDummyPosts() {
  const posts = []
  const now = new Date()
  
  // 고정 게시물
  posts.push({
    id: 'pinned-1',
    title: '🎉 Claude Code Korea 커뮤니티 오픈!',
    content: '안녕하세요, Claude Code Korea 커뮤니티가 오픈했습니다.',
    author: { username: 'xavierchoi', display_name: 'Xavier Choi', level: 10 },
    category: { name: '공지', color: '#ef4444' },
    created_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    view_count: 1523,
    like_count: 89,
    comment_count: 45,
    is_pinned: true,
    is_hot: false,
    has_attachment: false,
    is_new: false
  })
  
  // 인기 게시물
  posts.push({
    id: 'hot-1',
    title: 'Claude API로 나만의 AI 비서 만들기 완벽 가이드',
    content: 'Claude API를 활용한 AI 비서 만들기',
    author: { username: 'hunmintest', display_name: 'Hunmin Test', level: 8 },
    category: { name: '팁/노하우', color: '#10b981' },
    created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    view_count: 856,
    like_count: 67,
    comment_count: 23,
    is_pinned: false,
    is_hot: true,
    has_attachment: true,
    is_new: true
  })
  
  // 일반 게시물들
  const titles = [
    'SvelteKit에서 Claude API 연동하는 방법 질문드립니다',
    'Anthropic 새로운 모델 출시 소식',
    '프롬프트 엔지니어링 팁 공유합니다',
    'Claude vs GPT-4 성능 비교해봤습니다',
    '코드 리뷰 도와주실 분 계신가요?',
    'AI 개발자 모임 안내',
    '최신 Claude 업데이트 정리',
    '초보자를 위한 Claude 시작 가이드',
    '프로젝트에 AI 도입한 후기',
    'Claude로 만든 서비스 공유합니다'
  ]
  
  const usernames = [
    { username: 'xavierchoi', display_name: 'Xavier Choi', level: 10 },
    { username: 'hunmintest', display_name: 'Hunmin Test', level: 8 }
  ]
  
  const categoryList = ['general', 'qna', 'tips', 'showcase', 'feedback']
  const categoryColors: Record<string, string> = {
    general: '#6b7280',
    qna: '#3b82f6',
    tips: '#10b981',
    showcase: '#8b5cf6',
    feedback: '#f59e0b'
  }
  
  const categoryNames: Record<string, string> = {
    general: '일반',
    qna: '질문/답변',
    tips: '팁/노하우',
    showcase: '프로젝트',
    feedback: '피드백'
  }
  
  // 고정된 seed로 일관된 데이터 생성
  for (let i = 0; i < 15; i++) {
    const categoryId = categoryList[i % categoryList.length]
    const author = usernames[i % usernames.length]
    const hoursAgo = (i + 1) * 5
    const isNew = hoursAgo < 24
    
    const post: any = {
      id: `post-${i + 1}`,
      title: titles[i % titles.length],
      content: '게시물 내용...',
      author: { ...author },
      category: { 
        name: categoryNames[categoryId], 
        color: categoryColors[categoryId] 
      },
      created_at: new Date(now.getTime() - hoursAgo * 60 * 60 * 1000).toISOString(),
      view_count: 100 + i * 20,
      like_count: 10 + i * 2,
      comment_count: 5 + i,
      is_pinned: false,
      is_hot: false,
      has_attachment: i % 3 === 0,
      is_new: isNew,
      replies: []
    }
    
    // 일부 게시물에 답글 추가
    if (i % 3 === 0) {
      post.replies = [{
        id: `reply-${i}-1`,
        title: `Re: ${post.title}`,
        content: '답변 내용...',
        author: usernames[(i + 1) % usernames.length],
        category: post.category,
        created_at: new Date(now.getTime() - (hoursAgo - 1) * 60 * 60 * 1000).toISOString(),
        view_count: 50,
        like_count: 5,
        comment_count: 0,
        is_pinned: false,
        is_hot: false,
        has_attachment: false,
        is_new: isNew
      }]
    }
    
    posts.push(post)
  }
  
  return posts
}