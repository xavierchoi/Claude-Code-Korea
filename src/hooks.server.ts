import { handle as supabaseHandle } from '$lib/server/supabase'
import { sequence } from '@sveltejs/kit/hooks'

export const handle = sequence(supabaseHandle)
