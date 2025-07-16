import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { safeGetSession }, depends }) => {
  depends('supabase:auth')
  
  const { session, user } = await safeGetSession()

  // Only pass safe user data to avoid security warnings
  const safeSession = session ? {
    ...session,
    user: user // This user is validated via getUser()
  } : null
  
  return {
    session: safeSession
  }
}