import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { safeGetSession }, depends }) => {
  depends('supabase:auth')
  
  const { session } = await safeGetSession()
  
  return {
    session
  }
}