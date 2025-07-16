import type { PageServerLoad } from './$types'
import { requireAuth } from '$lib/utils/auth-guard'

export const load: PageServerLoad = async (event) => {
  // 인증 필수, 프로필(username) 설정도 필수
  const { session, user } = await requireAuth(event, { requireProfile: true })
  
  return {
    session,
    user
  }
}