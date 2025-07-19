import { describe, it, expect, vi } from 'vitest'
import { GET, POST } from '../../../routes/api/posts/[post_id]/comments/+server'
import { PUT, DELETE } from '../../../routes/api/comments/[id]/+server'
import type { RequestEvent } from '@sveltejs/kit'

describe('GET /api/posts/[post_id]/comments', () => {
	it('should return comments for a valid post', async () => {
		// Arrange
		const mockPostId = 'test-post-id'
		const mockEvent = {
			params: { post_id: mockPostId },
			locals: {
				supabase: {
					from: vi.fn().mockReturnValue({
						select: vi.fn().mockReturnValue({
							eq: vi.fn().mockReturnValue({
								order: vi.fn().mockResolvedValue({
									data: [],
									error: null
								})
							})
						})
					})
				}
			}
		} as unknown as RequestEvent

		// Act
		const response = await GET(mockEvent)
		const data = await response.json()

		// Assert
		expect(response.status).toBe(200)
		expect(data).toHaveProperty('comments')
		expect(Array.isArray(data.comments)).toBe(true)
	})

	it('should return comments with author information', async () => {
		// Arrange
		const mockPostId = 'test-post-id'
		const mockComments = [{
			id: 'comment-1',
			post_id: mockPostId,
			author_id: 'author-1',
			content: 'Test comment',
			parent_id: null,
			created_at: '2025-07-18T00:00:00',
			author: {
				id: 'author-1',
				username: 'testuser',
				full_name: 'Test User',
				avatar_url: 'https://example.com/avatar.jpg'
			}
		}]
		
		const mockEvent = {
			params: { post_id: mockPostId },
			locals: {
				supabase: {
					from: vi.fn().mockReturnValue({
						select: vi.fn().mockReturnValue({
							eq: vi.fn().mockReturnValue({
								order: vi.fn().mockResolvedValue({
									data: mockComments,
									error: null
								})
							})
						})
					})
				}
			}
		} as unknown as RequestEvent

		// Act
		const response = await GET(mockEvent)
		const data = await response.json()

		// Assert
		expect(response.status).toBe(200)
		expect(data.comments).toHaveLength(1)
		expect(data.comments[0]).toHaveProperty('author')
		expect(data.comments[0].author).toHaveProperty('username', 'testuser')
	})

	it('should return comments in hierarchical structure', async () => {
		// Arrange
		const mockPostId = 'test-post-id'
		const flatComments = [
			{
				id: 'comment-1',
				post_id: mockPostId,
				author_id: 'author-1',
				content: 'Parent comment',
				parent_id: null,
				created_at: '2025-07-18T00:00:00',
				author: { id: 'author-1', username: 'user1' }
			},
			{
				id: 'comment-2',
				post_id: mockPostId,
				author_id: 'author-2',
				content: 'Reply to parent',
				parent_id: 'comment-1',
				created_at: '2025-07-18T00:01:00',
				author: { id: 'author-2', username: 'user2' }
			},
			{
				id: 'comment-3',
				post_id: mockPostId,
				author_id: 'author-3',
				content: 'Another parent comment',
				parent_id: null,
				created_at: '2025-07-18T00:02:00',
				author: { id: 'author-3', username: 'user3' }
			}
		]
		
		const mockEvent = {
			params: { post_id: mockPostId },
			locals: {
				supabase: {
					from: vi.fn().mockReturnValue({
						select: vi.fn().mockReturnValue({
							eq: vi.fn().mockReturnValue({
								order: vi.fn().mockResolvedValue({
									data: flatComments,
									error: null
								})
							})
						})
					})
				}
			}
		} as unknown as RequestEvent

		// Act
		const response = await GET(mockEvent)
		const data = await response.json()

		// Assert
		expect(response.status).toBe(200)
		expect(data.comments).toHaveLength(2) // Only parent comments at root level
		expect(data.comments[0].replies).toBeDefined()
		expect(data.comments[0].replies).toHaveLength(1)
		expect(data.comments[0].replies[0].content).toBe('Reply to parent')
		expect(data.comments[1].replies).toHaveLength(0)
	})
})

describe('POST /api/posts/[post_id]/comments', () => {
	it('should create a new comment when authenticated', async () => {
		// Arrange
		const mockPostId = 'test-post-id'
		const mockUserId = 'test-user-id'
		const mockCommentData = {
			content: 'This is a test comment'
		}
		const mockCreatedComment = {
			id: 'new-comment-id',
			post_id: mockPostId,
			author_id: mockUserId,
			content: mockCommentData.content,
			parent_id: null,
			created_at: '2025-07-18T00:00:00',
			author: {
				id: mockUserId,
				username: 'testuser'
			}
		}
		
		const mockEvent = {
			params: { post_id: mockPostId },
			request: {
				json: vi.fn().mockResolvedValue(mockCommentData)
			},
			locals: {
				safeGetSession: vi.fn().mockResolvedValue({
					session: { user: { id: mockUserId } }
				}),
				supabase: {
					from: vi.fn().mockReturnValue({
						insert: vi.fn().mockReturnValue({
							select: vi.fn().mockReturnValue({
								single: vi.fn().mockResolvedValue({
									data: mockCreatedComment,
									error: null
								})
							})
						}),
						select: vi.fn().mockReturnValue({
							eq: vi.fn().mockResolvedValue({
								count: 1,
								error: null
							})
						}),
						update: vi.fn().mockReturnValue({
							eq: vi.fn().mockResolvedValue({
								error: null
							})
						})
					})
				}
			}
		} as unknown as RequestEvent

		// Act
		const response = await POST(mockEvent)
		const data = await response.json()

		// Assert
		expect(response.status).toBe(201)
		expect(data).toHaveProperty('comment')
		expect(data.comment.content).toBe(mockCommentData.content)
	})

	it('should require authentication to create a comment', async () => {
		// Arrange
		const mockEvent = {
			params: { post_id: 'test-post-id' },
			request: {
				json: vi.fn().mockResolvedValue({ content: 'Test' })
			},
			locals: {
				safeGetSession: vi.fn().mockResolvedValue({
					session: null
				})
			}
		} as unknown as RequestEvent

		// Act
		const response = await POST(mockEvent)
		const data = await response.json()

		// Assert
		expect(response.status).toBe(401)
		expect(data).toHaveProperty('error')
	})
})

describe('PUT /api/comments/[id]', () => {
	it('should update a comment when user is the author', async () => {
		// Arrange
		const mockCommentId = 'test-comment-id'
		const mockUserId = 'test-user-id'
		const mockUpdateData = {
			content: 'Updated comment content'
		}
		const mockUpdatedComment = {
			id: mockCommentId,
			author_id: mockUserId,
			content: mockUpdateData.content,
			is_edited: true,
			author: {
				id: mockUserId,
				username: 'testuser'
			}
		}
		
		const mockEvent = {
			params: { id: mockCommentId },
			request: {
				json: vi.fn().mockResolvedValue(mockUpdateData)
			},
			locals: {
				user: { id: mockUserId },
				supabase: {
					from: vi.fn().mockImplementation((table) => {
						if (table === 'comments') {
							return {
								select: vi.fn().mockReturnValue({
									eq: vi.fn().mockReturnValue({
										single: vi.fn().mockResolvedValue({
											data: { id: mockCommentId, author_id: mockUserId },
											error: null
										})
									})
								}),
								update: vi.fn().mockReturnValue({
									eq: vi.fn().mockReturnValue({
										select: vi.fn().mockReturnValue({
											single: vi.fn().mockResolvedValue({
												data: mockUpdatedComment,
												error: null
											})
										})
									})
								})
							}
						}
						if (table === 'profiles') {
							return {
								select: vi.fn().mockReturnValue({
									eq: vi.fn().mockReturnValue({
										single: vi.fn().mockResolvedValue({
											data: { is_admin: false },
											error: null
										})
									})
								})
							}
						}
					})
				}
			}
		} as unknown as RequestEvent

		// Act
		const response = await PUT(mockEvent)
		const data = await response.json()

		// Assert
		expect(response.status).toBe(200)
		expect(data).toHaveProperty('comment')
		expect(data.comment.content).toBe(mockUpdateData.content)
		expect(data.comment.is_edited).toBe(true)
	})

	it('should not allow updating comment by non-author', async () => {
		// Arrange
		const mockEvent = {
			params: { id: 'test-comment-id' },
			request: {
				json: vi.fn().mockResolvedValue({ content: 'Test' })
			},
			locals: {
				user: { id: 'different-user-id' },
				supabase: {
					from: vi.fn().mockImplementation((table) => {
						if (table === 'comments') {
							return {
								select: vi.fn().mockReturnValue({
									eq: vi.fn().mockReturnValue({
										single: vi.fn().mockResolvedValue({
											data: { id: 'test-comment-id', author_id: 'original-author-id' },
											error: null
										})
									})
								})
							}
						}
						if (table === 'profiles') {
							return {
								select: vi.fn().mockReturnValue({
									eq: vi.fn().mockReturnValue({
										single: vi.fn().mockResolvedValue({
											data: { is_admin: false },
											error: null
										})
									})
								})
							}
						}
					})
				}
			}
		} as unknown as RequestEvent

		// Act
		const response = await PUT(mockEvent)
		const data = await response.json()

		// Assert
		expect(response.status).toBe(403)
		expect(data).toHaveProperty('error')
	})

	it('should allow admin to update any comment', async () => {
		// Arrange
		const mockCommentId = 'test-comment-id'
		const mockAdminId = 'admin-user-id'
		const mockUpdateData = {
			content: 'Admin updated comment'
		}
		const mockUpdatedComment = {
			id: mockCommentId,
			author_id: 'original-author-id',
			content: mockUpdateData.content,
			is_edited: true,
			author: {
				id: 'original-author-id',
				username: 'originaluser'
			}
		}
		
		const mockEvent = {
			params: { id: mockCommentId },
			request: {
				json: vi.fn().mockResolvedValue(mockUpdateData)
			},
			locals: {
				user: { id: mockAdminId },
				supabase: {
					from: vi.fn().mockImplementation((table) => {
						if (table === 'comments') {
							return {
								select: vi.fn().mockReturnValue({
									eq: vi.fn().mockReturnValue({
										single: vi.fn().mockResolvedValue({
											data: { id: mockCommentId, author_id: 'original-author-id' },
											error: null
										})
									})
								}),
								update: vi.fn().mockReturnValue({
									eq: vi.fn().mockReturnValue({
										select: vi.fn().mockReturnValue({
											single: vi.fn().mockResolvedValue({
												data: mockUpdatedComment,
												error: null
											})
										})
									})
								})
							}
						}
						if (table === 'profiles') {
							return {
								select: vi.fn().mockReturnValue({
									eq: vi.fn().mockReturnValue({
										single: vi.fn().mockResolvedValue({
											data: { is_admin: true },
											error: null
										})
									})
								})
							}
						}
					})
				}
			}
		} as unknown as RequestEvent

		// Act
		const response = await PUT(mockEvent)
		const data = await response.json()

		// Assert
		expect(response.status).toBe(200)
		expect(data).toHaveProperty('comment')
		expect(data.comment.content).toBe(mockUpdateData.content)
	})
})

describe('DELETE /api/comments/[id]', () => {
	it('should delete a comment when user is the author', async () => {
		// Arrange
		const mockCommentId = 'test-comment-id'
		const mockUserId = 'test-user-id'
		const mockPostId = 'test-post-id'
		
		const mockEvent = {
			params: { id: mockCommentId },
			locals: {
				user: { id: mockUserId },
				supabase: {
					from: vi.fn().mockImplementation((table) => {
						if (table === 'comments') {
							return {
								select: vi.fn().mockReturnValue({
									eq: vi.fn().mockReturnValue({
										single: vi.fn().mockResolvedValue({
											data: { 
												id: mockCommentId, 
												author_id: mockUserId,
												post_id: mockPostId 
											},
											error: null
										})
									})
								}),
								update: vi.fn().mockReturnValue({
									eq: vi.fn().mockResolvedValue({
										error: null
									})
								})
							}
						}
						if (table === 'profiles') {
							return {
								select: vi.fn().mockReturnValue({
									eq: vi.fn().mockReturnValue({
										single: vi.fn().mockResolvedValue({
											data: { is_admin: false },
											error: null
										})
									})
								})
							}
						}
					})
				}
			}
		} as unknown as RequestEvent

		// Act
		const response = await DELETE(mockEvent)
		const data = await response.json()

		// Assert
		expect(response.status).toBe(200)
		expect(data).toHaveProperty('success', true)
	})

	it('should not allow deleting comment by non-author', async () => {
		// Arrange
		const mockEvent = {
			params: { id: 'test-comment-id' },
			locals: {
				user: { id: 'different-user-id' },
				supabase: {
					from: vi.fn().mockImplementation((table) => {
						if (table === 'comments') {
							return {
								select: vi.fn().mockReturnValue({
									eq: vi.fn().mockReturnValue({
										single: vi.fn().mockResolvedValue({
											data: { id: 'test-comment-id', author_id: 'original-author-id' },
											error: null
										})
									})
								})
							}
						}
						if (table === 'profiles') {
							return {
								select: vi.fn().mockReturnValue({
									eq: vi.fn().mockReturnValue({
										single: vi.fn().mockResolvedValue({
											data: { is_admin: false },
											error: null
										})
									})
								})
							}
						}
					})
				}
			}
		} as unknown as RequestEvent

		// Act
		const response = await DELETE(mockEvent)
		const data = await response.json()

		// Assert
		expect(response.status).toBe(403)
		expect(data).toHaveProperty('error')
	})

	it('should allow admin to delete any comment', async () => {
		// Arrange
		const mockCommentId = 'test-comment-id'
		const mockAdminId = 'admin-user-id'
		const mockPostId = 'test-post-id'
		
		const mockEvent = {
			params: { id: mockCommentId },
			locals: {
				user: { id: mockAdminId },
				supabase: {
					from: vi.fn().mockImplementation((table) => {
						if (table === 'comments') {
							return {
								select: vi.fn().mockReturnValue({
									eq: vi.fn().mockReturnValue({
										single: vi.fn().mockResolvedValue({
											data: { 
												id: mockCommentId, 
												author_id: 'original-author-id',
												post_id: mockPostId 
											},
											error: null
										})
									})
								}),
								update: vi.fn().mockReturnValue({
									eq: vi.fn().mockResolvedValue({
										error: null
									})
								})
							}
						}
						if (table === 'profiles') {
							return {
								select: vi.fn().mockReturnValue({
									eq: vi.fn().mockReturnValue({
										single: vi.fn().mockResolvedValue({
											data: { is_admin: true },
											error: null
										})
									})
								})
							}
						}
					})
				}
			}
		} as unknown as RequestEvent

		// Act
		const response = await DELETE(mockEvent)
		const data = await response.json()

		// Assert
		expect(response.status).toBe(200)
		expect(data).toHaveProperty('success', true)
	})
})