import { describe, it, expect, vi, beforeEach } from 'vitest'
import { profile } from './profile'

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        maybeSingle: vi.fn()
      }))
    }))
  }))
}

// Mock the supabase import
vi.mock('$lib/supabase', () => ({
  supabase: mockSupabase
}))

describe('Profile Store - hasUsername', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return false when no profile exists', async () => {
    // Mock the Supabase response for no profile
    mockSupabase.from().select().eq().maybeSingle.mockResolvedValue({
      data: null,
      error: null
    })

    const result = await profile.hasUsername('test-user-id')
    expect(result).toBe(false)
  })

  it('should return false when profile exists but has no username', async () => {
    // Mock the Supabase response for profile with null username
    mockSupabase.from().select().eq().maybeSingle.mockResolvedValue({
      data: { username: null },
      error: null
    })

    const result = await profile.hasUsername('test-user-id')
    expect(result).toBe(false)
  })

  it('should return true when profile exists and has username', async () => {
    // Mock the Supabase response for profile with username
    mockSupabase.from().select().eq().maybeSingle.mockResolvedValue({
      data: { username: 'testuser' },
      error: null
    })

    const result = await profile.hasUsername('test-user-id')
    expect(result).toBe(true)
  })

  it('should return false when there is an error', async () => {
    // Mock the Supabase response with error
    mockSupabase.from().select().eq().maybeSingle.mockResolvedValue({
      data: null,
      error: { message: 'Database error' }
    })

    const result = await profile.hasUsername('test-user-id')
    expect(result).toBe(false)
  })

  it('should handle promise rejection', async () => {
    // Mock the Supabase response to reject
    mockSupabase.from().select().eq().maybeSingle.mockRejectedValue(new Error('Network error'))

    const result = await profile.hasUsername('test-user-id')
    expect(result).toBe(false)
  })
})