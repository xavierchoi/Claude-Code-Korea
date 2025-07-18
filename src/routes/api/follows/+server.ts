import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

// POST: 팔로우 생성
export const POST: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
  try {
    const { session, user } = await safeGetSession()
    
    if (!session) {
      return json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }
    
    const { following_id } = await request.json()
    
    if (!following_id) {
      return json({ error: '팔로우할 사용자 ID가 필요합니다.' }, { status: 400 })
    }
    
    // 자기 자신을 팔로우하는지 확인
    if (user.id === following_id) {
      return json({ error: '자기 자신을 팔로우할 수 없습니다.' }, { status: 400 })
    }
    
    // 팔로우할 사용자가 존재하는지 확인
    const { data: targetUser, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', following_id)
      .single()
    
    if (userError || !targetUser) {
      return json({ error: '존재하지 않는 사용자입니다.' }, { status: 404 })
    }
    
    // 이미 팔로우하고 있는지 확인
    const { data: existingFollow } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', following_id)
      .single()
    
    if (existingFollow) {
      return json({ error: '이미 팔로우하고 있습니다.' }, { status: 409 })
    }
    
    // 팔로우 생성
    const { data: follow, error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id: following_id
      })
      .select()
      .single()
    
    if (error) {
      console.error('Follow creation error:', error)
      return json({ error: '팔로우 생성 중 오류가 발생했습니다.' }, { status: 500 })
    }
    
    return json({ follow }, { status: 201 })
  } catch (err) {
    console.error('Follow creation error:', err)
    return json({ error: '팔로우 생성 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

// DELETE: 팔로우 삭제 (언팔로우)
export const DELETE: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
  try {
    const { session, user } = await safeGetSession()
    
    if (!session) {
      return json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }
    
    const { following_id } = await request.json()
    
    if (!following_id) {
      return json({ error: '언팔로우할 사용자 ID가 필요합니다.' }, { status: 400 })
    }
    
    // 팔로우 관계 삭제
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', following_id)
    
    if (error) {
      console.error('Follow deletion error:', error)
      return json({ error: '언팔로우 중 오류가 발생했습니다.' }, { status: 500 })
    }
    
    return json({ message: '언팔로우가 완료되었습니다.' })
  } catch (err) {
    console.error('Follow deletion error:', err)
    return json({ error: '언팔로우 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

// GET: 팔로우 상태 확인
export const GET: RequestHandler = async ({ url, locals: { supabase, safeGetSession } }) => {
  try {
    const { session, user } = await safeGetSession()
    
    const following_id = url.searchParams.get('following_id')
    
    if (!following_id) {
      return json({ error: '확인할 사용자 ID가 필요합니다.' }, { status: 400 })
    }
    
    if (!session) {
      return json({ isFollowing: false })
    }
    
    // 팔로우 상태 확인
    const { data: follow } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', following_id)
      .single()
    
    return json({ isFollowing: !!follow })
  } catch (err) {
    console.error('Follow status check error:', err)
    return json({ error: '팔로우 상태 확인 중 오류가 발생했습니다.' }, { status: 500 })
  }
}