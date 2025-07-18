import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const PUT: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
  const { session, user } = await safeGetSession()
  
  if (!session) {
    return json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const updates = await request.json()
    
    // Validate credentials fields
    const allowedFields = [
      'education',
      'university',
      'major',
      'graduation_year',
      'degree',
      'certifications',
      'languages',
      'achievements',
      'courses'
    ]
    
    const updateData: any = {}
    
    // Only include allowed fields
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        const value = updates[field]
        
        // Skip empty strings
        if (value === '') {
          updateData[field] = null
          continue
        }
        
        // Validate graduation_year if provided
        if (field === 'graduation_year' && value) {
          const year = parseInt(value)
          const currentYear = new Date().getFullYear()
          if (isNaN(year) || year < 1950 || year > currentYear + 10) {
            return json({ error: 'Invalid graduation year' }, { status: 400 })
          }
          updateData[field] = year
        } else {
          updateData[field] = value
        }
      }
    }
    
    // Validate degree if provided
    if (updateData.degree !== undefined && updateData.degree) {
      const validDegrees = ['고등학교', '전문대학', '대학교', '대학원(석사)', '대학원(박사)', '기타']
      if (!validDegrees.includes(updateData.degree)) {
        return json({ error: 'Invalid degree type' }, { status: 400 })
      }
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Credentials update error:', error)
      return json({ error: 'Failed to update credentials' }, { status: 500 })
    }

    return json({ profile })
  } catch (e) {
    console.error('Credentials update error:', e)
    return json({ error: 'Invalid request body' }, { status: 400 })
  }
}