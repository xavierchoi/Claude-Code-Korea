import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession }, depends }) => {
  depends('supabase:auth')
  
  const { session } = await safeGetSession()

  if (!session) {
    throw redirect(303, '/auth')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return {
    session,
    profile
  }
}