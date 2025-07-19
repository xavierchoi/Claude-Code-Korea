<script lang="ts">
	import type { CommentWithReplies } from '$lib/types/comment'
	import CommentItem from './CommentItem.svelte'
	import { countAllComments } from '$lib/utils/comments'
	import { useRealtimeComments } from '$lib/hooks/useRealtimeComments'
	import { getContext } from 'svelte'
	import type { SupabaseClient } from '@supabase/supabase-js'
	
	interface Props {
		comments: CommentWithReplies[]
		postId: string
		currentUserId?: string
		isLoggedIn: boolean
		isAdmin?: boolean
	}
	
	let { comments: initialComments, postId, currentUserId, isLoggedIn, isAdmin = false }: Props = $props()
	
	// Supabase 클라이언트 가져오기
	const supabase = getContext<SupabaseClient>('supabase')
	
	// 초기 댓글이 있으면 store에 설정
	let storeInitialized = false
	
	// 실시간 댓글 구독 설정
	const { commentStore } = useRealtimeComments({
		supabase,
		postId,
		onError: (error) => {
			console.error('Realtime comment error:', error)
		}
	})
	
	// 초기 댓글 설정 (한 번만 실행)
	$effect(() => {
		if (!storeInitialized && initialComments && initialComments.length > 0) {
			// initialComments가 이미 계층 구조인지 확인
			if (initialComments[0] && 'replies' in initialComments[0]) {
				// 이미 계층 구조로 되어있으면 직접 설정
				commentStore.set({
					comments: initialComments as CommentWithReplies[],
					totalCount: countAllComments(initialComments as CommentWithReplies[]),
					channel: null
				})
			} else {
				// 플랫 배열이면 setComments 사용
				commentStore.setComments(initialComments)
			}
			storeInitialized = true
		}
	})
	
	// 실시간으로 업데이트되는 댓글 목록
	const comments = $derived($commentStore.comments)
	const totalCommentCount = $derived($commentStore.totalCount)
	
	let newCommentContent = $state('')
	let isSubmitting = $state(false)
	
	async function submitComment() {
		if (!newCommentContent.trim() || isSubmitting) return
		
		isSubmitting = true
		try {
			const response = await fetch(`/api/posts/${postId}/comments`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					content: newCommentContent
				})
			})
			
			if (response.ok) {
				// 실시간 업데이트가 자동으로 처리하므로 페이지 새로고침 불필요
				newCommentContent = ''
			} else {
				const error = await response.json()
				alert(error.error || '댓글 작성에 실패했습니다.')
			}
		} catch (err) {
			alert('댓글 작성 중 오류가 발생했습니다.')
		} finally {
			isSubmitting = false
		}
	}
</script>

<div class="comment-section">
	<div class="comment-header">
		<h3>댓글 <span class="comment-count">{totalCommentCount}</span></h3>
	</div>
	
	{#if isLoggedIn}
		<div class="comment-form">
			<textarea
				bind:value={newCommentContent}
				placeholder="댓글을 입력하세요..."
				rows="3"
				disabled={isSubmitting}
			></textarea>
			<div class="form-actions">
				<button 
					class="submit-btn"
					onclick={submitComment}
					disabled={!newCommentContent.trim() || isSubmitting}
				>
					{isSubmitting ? '작성 중...' : '댓글 작성'}
				</button>
			</div>
		</div>
	{:else}
		<div class="login-prompt">
			<p>댓글을 작성하려면 <a href="/auth/signin">로그인</a>이 필요합니다.</p>
		</div>
	{/if}
	
	<div class="comment-list">
		{#if comments.length === 0}
			<div class="no-comments">
				<p>아직 댓글이 없습니다. 첫 댓글을 작성해보세요!</p>
			</div>
		{:else}
			{#each comments as comment}
				<CommentItem 
					{comment} 
					{postId} 
					{currentUserId}
					{isAdmin}
					level={0}
				/>
			{/each}
		{/if}
	</div>
</div>

<style>
	.comment-section {
		margin-top: 2rem;
		background-color: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		padding: 1.5rem;
	}
	
	.comment-header {
		margin-bottom: 1.5rem;
	}
	
	.comment-header h3 {
		font-size: 1.25rem;
		font-weight: 700;
		color: #1f2937;
		margin: 0;
	}
	
	.comment-count {
		color: #6366f1;
		margin-left: 0.5rem;
	}
	
	.comment-form {
		margin-bottom: 1.5rem;
		padding-bottom: 1.5rem;
		border-bottom: 2px solid #e5e7eb;
	}
	
	.comment-form textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		resize: vertical;
		font-size: 0.875rem;
		line-height: 1.5;
	}
	
	.comment-form textarea:focus {
		outline: none;
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}
	
	.form-actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 0.5rem;
	}
	
	.submit-btn {
		padding: 0.5rem 1.5rem;
		background-color: #6366f1;
		color: white;
		border: none;
		border-radius: 0.375rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
	}
	
	.submit-btn:hover:not(:disabled) {
		background-color: #4f46e5;
	}
	
	.submit-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.login-prompt {
		background-color: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		padding: 1rem;
		text-align: center;
		margin-bottom: 1.5rem;
	}
	
	.login-prompt p {
		margin: 0;
		color: #6b7280;
	}
	
	.login-prompt a {
		color: #6366f1;
		text-decoration: none;
		font-weight: 500;
	}
	
	.login-prompt a:hover {
		text-decoration: underline;
	}
	
	.comment-list {
		margin-top: 1rem;
	}
	
	.no-comments {
		text-align: center;
		padding: 2rem;
		color: #9ca3af;
	}
	
	.no-comments p {
		margin: 0;
	}
</style>