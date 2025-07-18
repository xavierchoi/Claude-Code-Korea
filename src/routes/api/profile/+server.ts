import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals: { supabase, safeGetSession } }) => {
  const { session, user } = await safeGetSession()
  
  if (!session) {
    return json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Profile fetch error:', error)
    return json({ error: 'Failed to fetch profile' }, { status: 500 })
  }

  return json({ profile })
}

export const PUT: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
  const { session, user } = await safeGetSession()
  
  if (!session) {
    return json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const updates = await request.json()
    
    // Validate required fields
    if (updates.username && typeof updates.username !== 'string') {
      return json({ error: 'Invalid username format' }, { status: 400 })
    }

    // Check username uniqueness if username is being updated
    if (updates.username) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', updates.username)
        .neq('id', user.id)
        .single()

      if (existingProfile) {
        return json({ error: 'Username already taken' }, { status: 409 })
      }
    }

    // Check if user is admin
    const isAdmin = session.user.user_metadata?.role === 'admin'

    // Get current profile to check if full_name is already set
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    // Prevent changing full_name if it's already set (except for admins)
    if (!isAdmin && currentProfile?.full_name && updates.full_name && updates.full_name !== currentProfile.full_name) {
      return json({ error: 'Name cannot be changed once set' }, { status: 403 })
    }

    // Validate full_name format if it's being set or changed
    if (updates.full_name && (isAdmin || !currentProfile?.full_name)) {
      if (typeof updates.full_name !== 'string' || 
          updates.full_name.length < 2 || 
          updates.full_name.length > 20 ||
          !/^[가-힣a-zA-Z0-9\s]+$/.test(updates.full_name)) {
        return json({ error: 'Invalid name format. Name must be 2-20 characters and contain only Korean, English, numbers, and spaces.' }, { status: 400 })
      }
    }

    // Prepare update object, excluding full_name if it's already set (unless admin)
    const updateData: any = {
      username: updates.username,
      bio: updates.bio,
      website: updates.website,
      location: updates.location,
      github_username: updates.github_username,
      twitter_username: updates.twitter_username,
    }

    // Include full_name if it's not already set OR if user is admin
    if (updates.full_name && (isAdmin || !currentProfile?.full_name)) {
      updateData.full_name = updates.full_name
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Profile update error:', error)
      return json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return json({ profile })
  } catch (e) {
    console.error('Profile update error:', e)
    return json({ error: 'Invalid request body' }, { status: 400 })
  }
}