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
          .single()
        
        if (error) throw error
        
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
        throw error
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