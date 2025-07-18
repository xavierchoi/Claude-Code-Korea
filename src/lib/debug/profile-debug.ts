import { supabase } from '$lib/supabase'

export async function debugHasUsername(userId: string) {
  console.log('🔍 Debugging hasUsername for userId:', userId)
  
  try {
    // Step 1: Check if supabase client is initialized
    console.log('📡 Supabase client:', supabase)
    
    // Step 2: Try to get the user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('👤 Current auth user:', user?.id, 'Error:', authError)
    
    // Step 3: Check if profile exists
    console.log('🔍 Checking profile existence...')
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    
    console.log('👥 Profile data:', profileData)
    console.log('❌ Profile error:', profileError)
    
    // Step 4: Check specific username field
    if (profileData) {
      console.log('✅ Profile exists')
      console.log('👤 Username:', profileData.username)
      console.log('🔍 Username type:', typeof profileData.username)
      console.log('✅ Has username:', !!profileData.username)
    } else {
      console.log('❌ No profile found')
    }
    
    // Step 5: Test the actual query from hasUsername
    console.log('🔍 Testing exact hasUsername query...')
    const { data: usernameData, error: usernameError } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .maybeSingle()
    
    console.log('👤 Username query data:', usernameData)
    console.log('❌ Username query error:', usernameError)
    
    if (usernameError) {
      console.error('🚨 Error in hasUsername query:', usernameError)
      return false
    }
    
    if (!usernameData) {
      console.log('❌ No username data found')
      return false
    }
    
    const hasUsername = !!usernameData.username
    console.log('✅ Final result:', hasUsername)
    return hasUsername
    
  } catch (error) {
    console.error('🚨 Exception in debugHasUsername:', error)
    return false
  }
}

export async function debugProfileCreation(userId: string) {
  console.log('🔍 Debugging profile creation for userId:', userId)
  
  try {
    // Check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    
    console.log('👥 Existing profile:', existingProfile)
    console.log('❌ Check error:', checkError)
    
    if (existingProfile) {
      console.log('✅ Profile already exists')
      return existingProfile
    }
    
    // Try to create profile
    console.log('🔨 Creating new profile...')
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({ id: userId })
      .select()
      .single()
    
    console.log('👥 New profile:', newProfile)
    console.log('❌ Create error:', createError)
    
    return newProfile
    
  } catch (error) {
    console.error('🚨 Exception in debugProfileCreation:', error)
    return null
  }
}