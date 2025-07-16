import { redirect } from '@sveltejs/kit'
import type { RequestEvent } from '@sveltejs/kit'

interface AuthGuardOptions {
  redirectTo?: string
  requireProfile?: boolean
}

export async function requireAuth(
  event: RequestEvent,
  options: AuthGuardOptions = {}
) {
  const { redirectTo = '/auth', requireProfile = false } = options
  
  const { session, user } = await event.locals.safeGetSession()
  
  if (!session || !user) {
    const from = event.url.pathname + event.url.search
    throw redirect(303, `${redirectTo}?from=${encodeURIComponent(from)}`)
  }
  
  if (requireProfile) {
    try {
      const { data: profile } = await event.locals.supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()
      
      if (!profile?.username) {
        throw redirect(303, '/profile?setup=true')
      }
    } catch (error) {
      console.error('Error checking profile:', error)
      throw redirect(303, '/profile?setup=true')
    }
  }
  
  return { session, user }
}

export async function requireNoAuth(
  event: RequestEvent,
  redirectTo: string = '/'
) {
  const { session } = await event.locals.safeGetSession()
  
  if (session) {
    throw redirect(303, redirectTo)
  }
}