import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const PUT: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
  const { session, user } = await safeGetSession()
  
  if (!session) {
    return json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const updates = await request.json()
    
    // Validate career fields
    const allowedFields = [
      'job_title',
      'company', 
      'experience_years',
      'skills',
      'career_goals',
      'work_type',
      'remote_work'
    ]
    
    const updateData: any = {}
    
    // Only include allowed fields
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field]
      }
    }
    
    // Validate experience_years if provided
    if (updateData.experience_years !== undefined) {
      const years = parseInt(updateData.experience_years)
      if (isNaN(years) || years < 0 || years > 100) {
        return json({ error: 'Invalid experience years' }, { status: 400 })
      }
      updateData.experience_years = years
    }
    
    // Validate work_type if provided
    if (updateData.work_type !== undefined) {
      const validWorkTypes = ['full_time', 'part_time', 'contract', 'freelance', 'internship', 'student', 'unemployed']
      if (!validWorkTypes.includes(updateData.work_type)) {
        return json({ error: 'Invalid work type' }, { status: 400 })
      }
    }
    
    // Validate remote_work if provided
    if (updateData.remote_work !== undefined) {
      const validRemoteOptions = ['yes', 'no', 'hybrid']
      if (!validRemoteOptions.includes(updateData.remote_work)) {
        return json({ error: 'Invalid remote work option' }, { status: 400 })
      }
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Career update error:', error)
      return json({ error: 'Failed to update career information' }, { status: 500 })
    }

    return json({ profile })
  } catch (e) {
    console.error('Career update error:', e)
    return json({ error: 'Invalid request body' }, { status: 400 })
  }
}