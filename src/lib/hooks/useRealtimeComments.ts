import { onDestroy } from 'svelte'
import { get } from 'svelte/store'
import type { SupabaseClient } from '@supabase/supabase-js'
import { commentStore } from '$lib/stores/comments'
import type { CommentWithAuthor } from '$lib/types/comment'

interface RealtimeCommentOptions {
	supabase: SupabaseClient
	postId: string
	onError?: (error: Error) => void
}

export function useRealtimeComments({ supabase, postId, onError }: RealtimeCommentOptions) {
	let isSubscribed = false
	
	// 초기 댓글 로드
	async function loadComments() {
		try {
			const { data: comments, error } = await supabase
				.from('comments')
				.select(`
					*,
					author:profiles!comments_author_id_fkey (
						id,
						username,
						full_name,
						avatar_url
					)
				`)
				.eq('post_id', postId)
				.order('created_at', { ascending: true })

			if (error) throw error
			
			if (comments) {
				commentStore.setComments(comments)
			}
		} catch (err) {
			console.error('Failed to load comments:', err)
			onError?.(err as Error)
		}
	}
	
	// 실시간 구독 설정
	function subscribe() {
		if (isSubscribed) return
		
		console.log(`Setting up realtime subscription for post: ${postId}`)
		
		const channel = supabase
			.channel(`comments:post_id=eq.${postId}`)
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'comments'
				},
				(payload) => {
					console.log('Any comment event received:', payload)
				}
			)
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'comments',
					filter: `post_id=eq.${postId}`
				},
				async (payload) => {
					console.log('New comment received:', payload)
					console.log('Comment ID from payload:', payload.new.id)
					console.log('Comment content from payload:', payload.new.content)
					console.log('Post ID from payload:', payload.new.post_id)
					
					// 작성자 정보를 포함한 전체 댓글 데이터 가져오기
					const { data: comment, error } = await supabase
						.from('comments')
						.select(`
							*,
							author:profiles!comments_author_id_fkey (
								id,
								username,
								full_name,
								avatar_url
							)
						`)
						.eq('id', payload.new.id)
						.single()
					
					console.log('Fetch comment result:', { comment, error })
					
					if (error) {
						console.error('Failed to fetch comment author:', error)
					} else if (comment) {
						console.log('Adding comment to store:', comment)
						commentStore.addComment(comment)
					} else {
						console.error('Comment data is null')
					}
				}
			)
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'comments',
					filter: `post_id=eq.${postId}`
				},
				async (payload) => {
					console.log('Updated comment:', payload)
					
					// 수정된 댓글의 전체 데이터 가져오기
					const { data: comment, error } = await supabase
						.from('comments')
						.select(`
							*,
							author:profiles!comments_author_id_fkey (
								id,
								username,
								full_name,
								avatar_url
							)
						`)
						.eq('id', payload.new.id)
						.single()
					
					if (!error && comment) {
						commentStore.updateComment(comment.id, comment)
					}
				}
			)
			.on(
				'postgres_changes',
				{
					event: 'DELETE',
					schema: 'public',
					table: 'comments',
					filter: `post_id=eq.${postId}`
				},
				(payload) => {
					console.log('Deleted comment:', payload)
					commentStore.removeComment(payload.old.id as string)
				}
			)
			.subscribe((status) => {
				console.log(`Realtime subscription status for post ${postId}:`, status)
				if (status === 'SUBSCRIBED') {
					isSubscribed = true
					console.log(`Successfully subscribed to comments for post ${postId}`)
				}
			})
		
		commentStore.setChannel(channel)
	}
	
	// 구독 해제
	function unsubscribe() {
		commentStore.reset()
		isSubscribed = false
	}
	
	// 실시간 구독만 시작 (초기 로드는 CommentList에서 처리)
	subscribe()
	
	// 컴포넌트 언마운트 시 정리
	onDestroy(() => {
		unsubscribe()
	})
	
	return {
		commentStore,
		refresh: loadComments
	}
}