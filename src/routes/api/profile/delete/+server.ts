import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const DELETE: RequestHandler = async ({ locals: { supabase, safeGetSession } }) => {
  const { session, user } = await safeGetSession()
  
  if (!session) {
    return json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Start a transaction to delete user data
    // Note: In a real implementation, you might want to soft-delete or backup data
    
    // Delete user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id)

    if (profileError) {
      console.error('Profile deletion error:', profileError)
      return json({ error: 'Failed to delete profile' }, { status: 500 })
    }

    // Delete user from auth (this will cascade to other related data)
    const { error: authError } = await supabase.auth.admin.deleteUser(user.id)

    if (authError) {
      console.error('Auth deletion error:', authError)
      return json({ error: 'Failed to delete account' }, { status: 500 })
    }

    // Sign out the user
    const { error: signOutError } = await supabase.auth.signOut()

    if (signOutError) {
      console.error('Sign out error:', signOutError)
      // Don't return error here as the account is already deleted
    }

    return json({ message: 'Account successfully deleted' })
  } catch (e) {
    console.error('Account deletion error:', e)
    return json({ error: 'Failed to delete account' }, { status: 500 })
  }
}