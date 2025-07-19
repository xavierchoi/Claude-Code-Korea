import { onDestroy } from 'svelte'
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
		
		const channel = supabase
			.channel(`comments:post_id=eq.${postId}`)
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'comments',
					filter: `post_id=eq.${postId}`
				},
				async (payload) => {
					console.log('New comment:', payload)
					
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
					
					if (!error && comment) {
						commentStore.addComment(comment)
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
				console.log('Realtime subscription status:', status)
				if (status === 'SUBSCRIBED') {
					isSubscribed = true
				}
			})
		
		commentStore.setChannel(channel)
	}
	
	// 구독 해제
	function unsubscribe() {
		commentStore.reset()
		isSubscribed = false
	}
	
	// 컴포넌트 마운트 시 실행
	loadComments()
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