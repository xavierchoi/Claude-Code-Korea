import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession }, depends }) => {
  depends('supabase:auth')
  
  const { session, user } = await safeGetSession()

  if (!session) {
    throw redirect(303, '/auth')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return {
    session: {
      ...session,
      user: user // This user is validated via getUser()
    },
    profile
  }
}