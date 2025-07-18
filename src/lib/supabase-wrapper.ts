import { createClient } from '@supabase/supabase-js'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'

// Store original console.warn
const originalWarn = console.warn

// Filter out specific Supabase security warnings
console.warn = (...args) => {
  const warningMessage = args[0]?.toString() || ''
  
  // Skip the specific Supabase auth warning
  if (warningMessage.includes('Using the user object as returned from supabase.auth.getSession()')) {
    return
  }
  
  // Call original console.warn for other warnings
  originalWarn.apply(console, args)
}

// Create and export the Supabase client
export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY)