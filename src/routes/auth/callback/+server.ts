import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/'
  const error_description = url.searchParams.get('error_description')
  const error_code = url.searchParams.get('error')

  console.log('OAuth callback received:', { code: !!code, error_code, error_description })

  if (error_code) {
    console.error('OAuth error:', error_code, error_description)
    throw redirect(303, `/auth/auth-code-error?error=${error_code}&description=${encodeURIComponent(error_description || '')}`)
  }

  if (code) {
    console.log('Exchanging code for session...')
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Session exchange error:', error)
      throw redirect(303, `/auth/auth-code-error?error=session_exchange&description=${encodeURIComponent(error.message)}`)
    }
    
    if (data.session) {
      console.log('Session created successfully')
      throw redirect(303, `/${next.slice(1)}`)
    }
  }

  // If no code but we're here, it might be implicit flow with fragments
  // Redirect to a client-side handler
  throw redirect(303, '/auth/callback-client')
}