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

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        username: updates.username,
        full_name: updates.full_name,
        bio: updates.bio,
        website: updates.website,
        location: updates.location,
        github_username: updates.github_username,
        twitter_username: updates.twitter_username,
      })
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