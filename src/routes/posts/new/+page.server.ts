import type { PageServerLoad } from './$types'
import { requireAuth } from '$lib/utils/auth-guard'

export const load: PageServerLoad = async (event) => {
  // 인증 필수, 프로필(username) 설정도 필수
  const { session, user } = await requireAuth(event, { requireProfile: true })
  
  // 활성화된 카테고리 목록 가져오기
  const { data: categories } = await event.locals.supabase
    .from('categories')
    .select('id, name, slug, icon')
    .eq('is_active', true)
    .order('position', { ascending: true })
  
  return {
    session,
    user,
    categories: categories || []
  }
}