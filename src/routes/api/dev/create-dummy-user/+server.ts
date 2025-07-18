import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { dev } from '$app/environment'

// 개발 환경에서만 사용 가능한 더미 사용자 생성 API
export const POST: RequestHandler = async ({ request, locals: { supabase } }) => {
  // 개발 환경에서만 허용
  if (!dev) {
    return json({ error: 'This endpoint is only available in development mode' }, { status: 403 })
  }

  return json({ 
    error: 'Dummy user creation is not available due to authentication constraints',
    details: 'The profiles table requires a valid auth.users entry. Please test the follow system by creating a second account manually through the OAuth flow.'
  }, { status: 501 })
}

// 더미 사용자 목록 조회
export const GET: RequestHandler = async ({ locals: { supabase } }) => {
  // 개발 환경에서만 허용
  if (!dev) {
    return json({ error: 'This endpoint is only available in development mode' }, { status: 403 })
  }

  return json({ 
    users: [],
    message: 'Dummy users are not available due to authentication constraints'
  })
}

// 더미 사용자 삭제
export const DELETE: RequestHandler = async ({ request, locals: { supabase } }) => {
  // 개발 환경에서만 허용
  if (!dev) {
    return json({ error: 'This endpoint is only available in development mode' }, { status: 403 })
  }

  return json({ 
    error: 'Dummy user deletion is not available due to authentication constraints',
    details: 'The profiles table requires a valid auth.users entry. Please test the follow system by creating a second account manually through the OAuth flow.'
  }, { status: 501 })
}