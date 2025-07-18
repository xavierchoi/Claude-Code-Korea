import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const PUT: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
  const { session, user } = await safeGetSession()
  
  if (!session) {
    return json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const updates = await request.json()
    
    // Validate social fields
    const allowedFields = [
      'website',
      'github_username',
      'twitter_username', 
      'linkedin_url',
      'instagram_username',
      'youtube_url',
      'blog_url',
      'portfolio_url'
    ]
    
    const updateData: any = {}
    
    // Only include allowed fields and validate URLs
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        const value = updates[field]
        
        // Skip empty strings
        if (value === '') {
          updateData[field] = null
          continue
        }
        
        // Validate URL fields
        if (field === 'website' || field === 'linkedin_url' || field === 'youtube_url' || field === 'blog_url' || field === 'portfolio_url') {
          if (value && !isValidUrl(value)) {
            return json({ error: `Invalid ${field} URL format` }, { status: 400 })
          }
        }
        
        // Validate username fields (alphanumeric, underscore, hyphen)
        if (field.includes('username') && value) {
          if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
            return json({ error: `Invalid ${field} format` }, { status: 400 })
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
      console.error('Social links update error:', error)
      return json({ error: 'Failed to update social links' }, { status: 500 })
    }

    return json({ profile })
  } catch (e) {
    console.error('Social links update error:', e)
    return json({ error: 'Invalid request body' }, { status: 400 })
  }
}

// Helper function to validate URLs
function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch (_) {
    return false
  }
}