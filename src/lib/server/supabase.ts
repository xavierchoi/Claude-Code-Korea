import { createServerClient } from '@supabase/ssr'
import { type Handle } from '@sveltejs/kit'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (key) => event.cookies.get(key),
      set: (key, value, options) => {
        event.cookies.set(key, value, { ...options, path: '/' })
      },
      remove: (key, options) => {
        event.cookies.delete(key, { ...options, path: '/' })
      },
    },
  })

  /**
   * Get session with proper error handling and token refresh
   */
  event.locals.safeGetSession = async () => {
    try {
      const {
        data: { session },
        error: sessionError
      } = await event.locals.supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        return { session: null, user: null }
      }
      
      if (!session) {
        return { session: null, user: null }
      }

      // Validate the user with the current session
      const {
        data: { user },
        error: userError,
      } = await event.locals.supabase.auth.getUser()
      
      if (userError) {
        console.error('User validation error:', userError)
        // Clear invalid session
        await event.locals.supabase.auth.signOut()
        return { session: null, user: null }
      }

      return { session, user }
    } catch (error) {
      console.error('Safe get session error:', error)
      return { session: null, user: null }
    }
  }

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-api-version'
    },
  })
}