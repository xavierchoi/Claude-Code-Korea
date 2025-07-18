import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

// GET: 사용자 통계 조회 (팔로워/팔로잉 수 등)
export const GET: RequestHandler = async ({ params, locals: { supabase } }) => {
  try {
    const { id } = params
    
    if (!id) {
      return json({ error: '사용자 ID가 필요합니다.' }, { status: 400 })
    }
    
    // 사용자 존재 확인
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', id)
      .single()
    
    if (userError || !user) {
      return json({ error: '존재하지 않는 사용자입니다.' }, { status: 404 })
    }
    
    // 모든 통계 병렬 조회
    const [
      { count: followersCount },
      { count: followingCount },
      { count: postsCount },
      { count: commentsCount },
      { data: likesData },
      { count: projectsCount },
      { count: codeSnippetsCount }
    ] = await Promise.all([
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', id),
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', id),
      supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', id)
        .eq('is_published', true),
      supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', id),
      supabase
        .from('posts')
        .select('like_count')
        .eq('author_id', id)
        .eq('is_published', true),
      supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', id),
      supabase
        .from('code_snippets')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', id)
        .eq('is_public', true)
    ])
    
    // 받은 좋아요 수 계산
    const likesReceived = likesData?.reduce((sum, post) => sum + (post.like_count || 0), 0) || 0
    
    return json({
      stats: {
        followers: followersCount || 0,
        following: followingCount || 0,
        posts: postsCount || 0,
        comments: commentsCount || 0,
        likesReceived: likesReceived,
        projects: projectsCount || 0,
        codeSnippets: codeSnippetsCount || 0
      }
    })
  } catch (err) {
    console.error('User stats error:', err)
    return json({ error: '사용자 통계 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}