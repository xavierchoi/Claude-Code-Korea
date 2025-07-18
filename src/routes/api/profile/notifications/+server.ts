import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const PUT: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
  const { session, user } = await safeGetSession()
  
  if (!session) {
    return json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const updates = await request.json()
    
    // Validate notification settings fields
    const allowedFields = [
      // Activity notifications
      'notify_comments',
      'notify_replies',
      'notify_likes',
      'notify_follows',
      'notify_mentions',
      
      // Content notifications
      'notify_new_posts',
      'notify_post_updates',
      'notify_forum_digest',
      'notify_trending_content',
      
      // System notifications
      'notify_system_updates',
      'notify_maintenance',
      'notify_security_alerts',
      
      // Frequency settings
      'notification_frequency',
      'digest_frequency',
      
      // Quiet hours
      'quiet_hours_enabled',
      'quiet_hours_start',
      'quiet_hours_end'
    ]
    
    const updateData: any = {}
    
    // Only include allowed fields
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        const value = updates[field]
        
        // Validate boolean fields
        if (field.startsWith('notify_') || field === 'quiet_hours_enabled') {
          if (typeof value !== 'boolean') {
            return json({ error: `Invalid ${field} value` }, { status: 400 })
          }
        }
        
        // Validate frequency fields
        if (field === 'notification_frequency') {
          const validFrequencies = ['immediate', 'hourly', 'daily', 'weekly', 'never']
          if (!validFrequencies.includes(value)) {
            return json({ error: 'Invalid notification frequency' }, { status: 400 })
          }
        }
        
        if (field === 'digest_frequency') {
          const validFrequencies = ['daily', 'weekly', 'monthly', 'never']
          if (!validFrequencies.includes(value)) {
            return json({ error: 'Invalid digest frequency' }, { status: 400 })
          }
        }
        
        // Validate time fields (HH:MM format)
        if (field === 'quiet_hours_start' || field === 'quiet_hours_end') {
          if (value && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
            return json({ error: `Invalid ${field} time format` }, { status: 400 })
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
      console.error('Notification settings update error:', error)
      return json({ error: 'Failed to update notification settings' }, { status: 500 })
    }

    return json({ profile })
  } catch (e) {
    console.error('Notification settings update error:', e)
    return json({ error: 'Invalid request body' }, { status: 400 })
  }
}