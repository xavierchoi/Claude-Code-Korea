import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals }) => {
	const { session } = await locals.safeGetSession()
	
	return json({
		authenticated: !!session,
		user: session?.user || null
	})
}

export const POST: RequestHandler = async ({ request, locals: { supabase } }) => {
  try {
    const { access_token, refresh_token } = await request.json()
    
    if (!access_token || !refresh_token) {
      return json({ error: 'Missing tokens' }, { status: 400 })
    }

    // Set the session on the server-side supabase client
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token
    })

    if (error) {
      console.error('Server session error:', error)
      return json({ error: error.message }, { status: 400 })
    }

    if (data.session) {
      return json({ success: true, session: data.session })
    } else {
      return json({ error: 'Failed to create session' }, { status: 400 })
    }
  } catch (error) {
    console.error('Session API error:', error)
    return json({ error: 'Invalid request' }, { status: 400 })
  }
}