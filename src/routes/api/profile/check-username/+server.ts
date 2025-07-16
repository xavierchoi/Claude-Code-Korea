import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
  const { session, user } = await safeGetSession()
  
  if (!session) {
    return json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { username } = await request.json()
    
    if (!username || typeof username !== 'string') {
      return json({ error: 'Username is required' }, { status: 400 })
    }

    // Check if username is valid (alphanumeric, underscore, hyphen only)
    const usernameRegex = /^[a-zA-Z0-9_-]+$/
    if (!usernameRegex.test(username)) {
      return json({ 
        available: false, 
        error: 'Username can only contain letters, numbers, underscores, and hyphens' 
      })
    }

    // Check minimum length
    if (username.length < 3) {
      return json({ 
        available: false, 
        error: 'Username must be at least 3 characters long' 
      })
    }

    // Check maximum length
    if (username.length > 30) {
      return json({ 
        available: false, 
        error: 'Username must be less than 30 characters long' 
      })
    }

    // Check if username is already taken
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .neq('id', user.id)
      .single()

    const available = !existingProfile

    return json({ 
      available,
      error: available ? null : 'Username is already taken'
    })
  } catch (e) {
    console.error('Username check error:', e)
    return json({ error: 'Invalid request' }, { status: 400 })
  }
}