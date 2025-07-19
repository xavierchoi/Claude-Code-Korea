import { handle as supabaseHandle } from '$lib/server/supabase'
import { sequence } from '@sveltejs/kit/hooks'
import type { Handle } from '@sveltejs/kit'

const authHandle: Handle = async ({ event, resolve }) => {
	// Get the session and set user in locals
	const { session, user } = await event.locals.safeGetSession()
	event.locals.user = user
	
	return resolve(event)
}

export const handle = sequence(supabaseHandle, authHandle)
