import { describe, it, expect, beforeEach } from 'vitest'
import { get } from 'svelte/store'
import { commentStore } from '$lib/stores/comments'
import type { CommentWithAuthor, CommentWithReplies } from '$lib/types/comment'

describe('Comment Store', () => {
	beforeEach(() => {
		commentStore.reset()
	})

	it('should initialize with empty comments', () => {
		const state = get(commentStore)
		expect(state.comments).toEqual([])
		expect(state.totalCount).toBe(0)
		expect(state.channel).toBe(null)
	})

	it('should set comments and build tree structure', () => {
		const mockComments: CommentWithAuthor[] = [
			{
				id: '1',
				post_id: 'post1',
				author_id: 'user1',
				content: 'Parent comment',
				parent_id: null,
				created_at: '2025-01-01T00:00:00',
				is_edited: false,
				author: {
					id: 'user1',
					username: 'user1',
					full_name: 'User One',
					avatar_url: null
				}
			},
			{
				id: '2',
				post_id: 'post1',
				author_id: 'user2',
				content: 'Reply to parent',
				parent_id: '1',
				created_at: '2025-01-01T00:01:00',
				is_edited: false,
				author: {
					id: 'user2',
					username: 'user2',
					full_name: 'User Two',
					avatar_url: null
				}
			}
		]

		commentStore.setComments(mockComments)
		const state = get(commentStore)

		expect(state.totalCount).toBe(2)
		expect(state.comments).toHaveLength(1) // Only parent at root
		expect(state.comments[0].replies).toHaveLength(1)
		expect(state.comments[0].replies![0].content).toBe('Reply to parent')
	})

	it('should add new comment to the tree', () => {
		const initialComment: CommentWithAuthor = {
			id: '1',
			post_id: 'post1',
			author_id: 'user1',
			content: 'Initial comment',
			parent_id: null,
			created_at: '2025-01-01T00:00:00',
			is_edited: false,
			author: {
				id: 'user1',
				username: 'user1',
				full_name: 'User One',
				avatar_url: null
			}
		}

		commentStore.setComments([initialComment])

		const newComment: CommentWithAuthor = {
			id: '2',
			post_id: 'post1',
			author_id: 'user2',
			content: 'New comment',
			parent_id: null,
			created_at: '2025-01-01T00:01:00',
			is_edited: false,
			author: {
				id: 'user2',
				username: 'user2',
				full_name: 'User Two',
				avatar_url: null
			}
		}

		commentStore.addComment(newComment)
		const state = get(commentStore)

		expect(state.totalCount).toBe(2)
		expect(state.comments).toHaveLength(2)
		expect(state.comments[1].content).toBe('New comment')
	})

	it('should update existing comment', () => {
		const comment: CommentWithAuthor = {
			id: '1',
			post_id: 'post1',
			author_id: 'user1',
			content: 'Original content',
			parent_id: null,
			created_at: '2025-01-01T00:00:00',
			is_edited: false,
			author: {
				id: 'user1',
				username: 'user1',
				full_name: 'User One',
				avatar_url: null
			}
		}

		commentStore.setComments([comment])
		commentStore.updateComment('1', { 
			content: 'Updated content',
			is_edited: true 
		})

		const state = get(commentStore)
		expect(state.comments[0].content).toBe('Updated content')
		expect(state.comments[0].is_edited).toBe(true)
	})

	it('should remove comment from tree', () => {
		const comments: CommentWithAuthor[] = [
			{
				id: '1',
				post_id: 'post1',
				author_id: 'user1',
				content: 'Comment 1',
				parent_id: null,
				created_at: '2025-01-01T00:00:00',
				is_edited: false,
				author: {
					id: 'user1',
					username: 'user1',
					full_name: 'User One',
					avatar_url: null
				}
			},
			{
				id: '2',
				post_id: 'post1',
				author_id: 'user2',
				content: 'Comment 2',
				parent_id: null,
				created_at: '2025-01-01T00:01:00',
				is_edited: false,
				author: {
					id: 'user2',
					username: 'user2',
					full_name: 'User Two',
					avatar_url: null
				}
			}
		]

		commentStore.setComments(comments)
		commentStore.removeComment('1')

		const state = get(commentStore)
		expect(state.totalCount).toBe(1)
		expect(state.comments).toHaveLength(1)
		expect(state.comments[0].id).toBe('2')
	})
})