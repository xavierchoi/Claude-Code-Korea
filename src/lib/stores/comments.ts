import { writable } from 'svelte/store'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { CommentWithReplies, CommentWithAuthor } from '$lib/types/comment'
import { buildCommentTree } from '$lib/utils/comments'

interface CommentStore {
	comments: CommentWithReplies[]
	totalCount: number
	channel: RealtimeChannel | null
}

function createCommentStore() {
	const { subscribe, set, update } = writable<CommentStore>({
		comments: [],
		totalCount: 0,
		channel: null
	})

	return {
		subscribe,
		set,
		update,
		
		// 댓글 목록 설정
		setComments: (comments: CommentWithAuthor[]) => {
			const tree = buildCommentTree(comments)
			update(store => ({
				...store,
				comments: tree,
				totalCount: comments.length
			}))
		},
		
		// 새 댓글 추가
		addComment: (comment: CommentWithAuthor) => {
			console.log('Adding comment to store:', comment.id, comment.content.substring(0, 50))
			update(store => {
				const allComments = flattenComments(store.comments)
				
				// 중복 댓글 방지
				const exists = allComments.find(c => c.id === comment.id)
				if (exists) {
					console.log('Comment already exists, skipping:', comment.id)
					return store
				}
				
				allComments.push(comment)
				const tree = buildCommentTree(allComments)
				
				console.log('Updated comment tree count:', allComments.length)
				return {
					...store,
					comments: tree,
					totalCount: allComments.length
				}
			})
		},
		
		// 댓글 수정
		updateComment: (commentId: string, updates: Partial<CommentWithAuthor>) => {
			update(store => {
				const allComments = flattenComments(store.comments)
				const index = allComments.findIndex(c => c.id === commentId)
				
				if (index !== -1) {
					allComments[index] = { ...allComments[index], ...updates }
					const tree = buildCommentTree(allComments)
					
					return {
						...store,
						comments: tree,
						totalCount: allComments.length
					}
				}
				
				return store
			})
		},
		
		// 댓글 삭제
		removeComment: (commentId: string) => {
			update(store => {
				const allComments = flattenComments(store.comments)
				const filtered = allComments.filter(c => c.id !== commentId)
				const tree = buildCommentTree(filtered)
				
				return {
					...store,
					comments: tree,
					totalCount: filtered.length
				}
			})
		},
		
		// 실시간 채널 설정
		setChannel: (channel: RealtimeChannel | null) => {
			update(store => ({ ...store, channel }))
		},
		
		// 정리
		reset: () => {
			update(store => {
				// 채널이 있으면 구독 해제
				if (store.channel) {
					console.log('Unsubscribing from realtime channel')
					store.channel.unsubscribe()
				}
				
				return {
					comments: [],
					totalCount: 0,
					channel: null
				}
			})
		}
	}
}

// 계층형 댓글을 평면 배열로 변환
function flattenComments(comments: CommentWithReplies[]): CommentWithAuthor[] {
	const result: CommentWithAuthor[] = []
	
	function flatten(commentList: CommentWithReplies[]) {
		for (const comment of commentList) {
			const { replies, ...commentData } = comment
			result.push(commentData as CommentWithAuthor)
			
			if (replies && replies.length > 0) {
				flatten(replies)
			}
		}
	}
	
	flatten(comments)
	return result
}

export const commentStore = createCommentStore()