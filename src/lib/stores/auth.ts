import { writable, derived } from 'svelte/store'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '$lib/supabase'
import { browser } from '$app/environment'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  initialized: boolean
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    session: null,
    loading: true,
    initialized: false
  })

  return {
    subscribe,
    
    async initialize() {
      if (!browser) return
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          set({ user: null, session: null, loading: false, initialized: true })
          return
        }
        
        // Validate user with getUser() for security
        if (session) {
          const { data: { user }, error: userError } = await supabase.auth.getUser()
          
          if (userError || !user) {
            console.error('User validation error:', userError)
            set({ user: null, session: null, loading: false, initialized: true })
            return
          }
          
          set({
            user: user,
            session: session,
            loading: false,
            initialized: true
          })
        } else {
          set({
            user: null,
            session: null,
            loading: false,
            initialized: true
          })
        }
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            if (session) {
              // Validate user with getUser() for security
              const { data: { user }, error: userError } = await supabase.auth.getUser()
              
              if (userError || !user) {
                console.error('User validation error in auth state change:', userError)
                set({
                  user: null,
                  session: null,
                  loading: false,
                  initialized: true
                })
              } else {
                set({
                  user: user,
                  session: session,
                  loading: false,
                  initialized: true
                })
              }
            } else {
              set({
                user: null,
                session: null,
                loading: false,
                initialized: true
              })
            }
          }
        )
        
        return () => subscription.unsubscribe()
      } catch (error) {
        console.error('Error initializing auth:', error)
        set({ user: null, session: null, loading: false, initialized: true })
      }
    },
    
    async signIn(provider: 'google' | 'github') {
      update(state => ({ ...state, loading: true }))
      
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/auth/callback`
          }
        })
        
        if (error) throw error
      } catch (error) {
        console.error('Error signing in:', error)
        update(state => ({ ...state, loading: false }))
        throw error
      }
    },
    
    async signOut() {
      update(state => ({ ...state, loading: true }))
      
      try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        
        set({
          user: null,
          session: null,
          loading: false,
          initialized: true
        })
      } catch (error) {
        console.error('Error signing out:', error)
        update(state => ({ ...state, loading: false }))
        throw error
      }
    },
    
    async refreshSession() {
      update(state => ({ ...state, loading: true }))
      
      try {
        const { data: { session }, error } = await supabase.auth.refreshSession()
        
        if (error) throw error
        
        set({
          user: session?.user ?? null,
          session: session ?? null,
          loading: false,
          initialized: true
        })
      } catch (error) {
        console.error('Error refreshing session:', error)
        update(state => ({ ...state, loading: false }))
        throw error
      }
    }
  }
}

export const auth = createAuthStore()

export const isAuthenticated = derived(
  auth,
  $auth => !!$auth.user && !!$auth.session && !$auth.loading
)

export const isLoading = derived(
  auth,
  $auth => $auth.loading
)

export const user = derived(
  auth,
  $auth => $auth.user
)

export const session = derived(
  auth,
  $auth => $auth.session
)