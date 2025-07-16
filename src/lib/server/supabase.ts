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
   * Get session with proper error handling and secure user validation
   */
  event.locals.safeGetSession = async () => {
    try {
      // First get the session
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

      // Always validate the user with getUser() for security
      const {
        data: { user },
        error: userError,
      } = await event.locals.supabase.auth.getUser()
      
      if (userError) {
        console.error('User validation error:', userError)
        return { session: null, user: null }
      }

      if (!user) {
        return { session: null, user: null }
      }

      // Return session with validated user
      return { 
        session: {
          ...session,
          user // Use the validated user from getUser()
        }, 
        user 
      }
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