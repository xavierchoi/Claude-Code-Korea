import { writable, derived } from 'svelte/store'
import { supabase } from '$lib/supabase'
import type { User } from '@supabase/supabase-js'

export interface Profile {
  id: string
  username: string | null
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  location: string | null
  website: string | null
  created_at: string
  updated_at: string
}

interface ProfileState {
  profile: Profile | null
  loading: boolean
  error: string | null
}

function createProfileStore() {
  const { subscribe, set, update } = writable<ProfileState>({
    profile: null,
    loading: false,
    error: null
  })

  return {
    subscribe,
    
    async fetchProfile(userId: string) {
      update(state => ({ ...state, loading: true, error: null }))
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle() // Use maybeSingle instead of single to handle no rows gracefully
        
        if (error) throw error
        
        // If no profile exists, create a minimal one
        if (!data) {
          console.log('No profile found, creating minimal profile')
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({ id: userId })
            .select()
            .single()
          
          if (createError) {
            console.error('Error creating profile:', createError)
            throw createError
          }
          
          set({
            profile: newProfile,
            loading: false,
            error: null
          })
          
          return newProfile
        }
        
        set({
          profile: data,
          loading: false,
          error: null
        })
        
        return data
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch profile'
        set({
          profile: null,
          loading: false,
          error: message
        })
        console.error('Error fetching profile:', error)
        // Don't throw to prevent uncaught promise errors
      }
    },
    
    async updateProfile(userId: string, updates: Partial<Profile>) {
      update(state => ({ ...state, loading: true, error: null }))
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select()
          .single()
        
        if (error) throw error
        
        set({
          profile: data,
          loading: false,
          error: null
        })
        
        return data
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update profile'
        update(state => ({ ...state, loading: false, error: message }))
        throw error
      }
    },
    
    async checkUsernameAvailability(username: string, currentUserId?: string) {
      try {
        let query = supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
        
        if (currentUserId) {
          query = query.neq('id', currentUserId)
        }
        
        const { data, error } = await query
        
        if (error) throw error
        
        return data.length === 0
      } catch (error) {
        console.error('Error checking username:', error)
        return false
      }
    },
    
    async hasUsername(userId: string) {
      try {
        if (!userId) {
          console.error('hasUsername: No userId provided')
          return false
        }
        
        // 더 간단한 쿼리로 시도
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', userId)
          .single()
        
        if (error) {
          console.error('hasUsername: Supabase error:', error)
          // 프로필이 없는 경우 (PGRST116)라면 false 반환
          if (error.code === 'PGRST116') {
            return false
          }
          throw error
        }
        
        return !!data.username
      } catch (error) {
        console.error('hasUsername: Exception:', error)
        throw error
      }
    },
    
    reset() {
      set({
        profile: null,
        loading: false,
        error: null
      })
    }
  }
}

export const profile = createProfileStore()

export const profileLoading = derived(
  profile,
  $profile => $profile.loading
)

export const profileError = derived(
  profile,
  $profile => $profile.error
)

export const currentProfile = derived(
  profile,
  $profile => $profile.profile
)