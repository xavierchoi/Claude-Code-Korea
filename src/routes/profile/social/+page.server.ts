import type { PageServerLoad } from './$types'
import { requireAuth } from '$lib/utils/auth-guard'

export const load: PageServerLoad = async (event) => {
  const { locals: { supabase }, depends } = event
  depends('supabase:auth')
  
  const { session, user } = await requireAuth(event)

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