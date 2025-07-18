import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const PUT: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
  const { session, user } = await safeGetSession()
  
  if (!session) {
    return json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const updates = await request.json()
    
    // Validate account settings fields
    const allowedFields = [
      'privacy_level',
      'profile_searchable',
      'email_notifications',
      'marketing_emails'
    ]
    
    const updateData: any = {}
    
    // Only include allowed fields
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        const value = updates[field]
        
        // Validate privacy_level
        if (field === 'privacy_level' && value) {
          const validLevels = ['public', 'members', 'private']
          if (!validLevels.includes(value)) {
            return json({ error: 'Invalid privacy level' }, { status: 400 })
          }
        }
        
        // Validate boolean fields
        if (['profile_searchable', 'email_notifications', 'marketing_emails'].includes(field)) {
          if (typeof value !== 'boolean') {
            return json({ error: `Invalid ${field} value` }, { status: 400 })
          }
        }
        
        updateData[field] = value
      }
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Account settings update error:', error)
      return json({ error: 'Failed to update account settings' }, { status: 500 })
    }

    return json({ profile })
  } catch (e) {
    console.error('Account settings update error:', e)
    return json({ error: 'Invalid request body' }, { status: 400 })
  }
}