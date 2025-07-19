<script lang="ts">
	import type { CommentWithReplies } from '$lib/types/comment'
	import { onMount } from 'svelte'
	import { toast } from '$lib/stores/toast'
	import { invalidateAll } from '$app/navigation'
	
	interface Props {
		comment: CommentWithReplies
		level?: number
		postId: string
		currentUserId?: string
		isAdmin?: boolean
	}
	
	let { comment, level = 0, postId, currentUserId, isAdmin = false }: Props = $props()
	
	// 프로필 이미지 디버깅
	$effect(() => {
		console.log('Comment author info:', {
			username: comment.author?.username,
			avatar_url: comment.author?.avatar_url,
			full_name: comment.author?.full_name
		})
	})
	
	// 날짜 포맷팅
	function formatDate(dateString: string) {
		const date = new Date(dateString)
		const now = new Date()
		const diff = now.getTime() - date.getTime()
		const seconds = Math.floor(diff / 1000)
		const minutes = Math.floor(seconds / 60)
		const hours = Math.floor(minutes / 60)
		const days = Math.floor(hours / 24)
		
		if (days > 0) {
			const month = String(date.getMonth() + 1).padStart(2, '0')
			const day = String(date.getDate()).padStart(2, '0')
			const hour = String(date.getHours()).padStart(2, '0')
			const minute = String(date.getMinutes()).padStart(2, '0')
			return `${month}.${day} ${hour}:${minute}`
		} else if (hours > 0) {
			return `${hours}시간 전`
		} else if (minutes > 0) {
			return `${minutes}분 전`
		} else {
			return '방금 전'
		}
	}
	
	let showReplyForm = $state(false)
	let replyContent = $state('')
	let isSubmitting = $state(false)
	let isEditing = $state(false)
	let editContent = $state(comment.content)
	let isDeleting = $state(false)
	let imageError = $state(false)
	
	function handleImageError() {
		console.log('Image load error for:', comment.author.avatar_url)
		imageError = true
	}
	
	async function submitReply() {
		if (!replyContent.trim() || isSubmitting) return
		
		isSubmitting = true
		try {
			const response = await fetch(`/api/posts/${postId}/comments`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					content: replyContent,
					parent_id: comment.id
				})
			})
			
			if (response.ok) {
				const result = await response.json()
				const newReplyId = result.comment?.id
				
				// 실시간 업데이트가 자동으로 처리
				showReplyForm = false
				replyContent = ''
				isEditing = false
				editContent = comment.content
				toast.success('답글이 작성되었습니다.')
				
				// 페이지 데이터 새로고침 후 스크롤
				setTimeout(async () => {
					console.log('Starting invalidateAll for new reply:', newReplyId)
					await invalidateAll()
					
					// DOM 업데이트를 위한 추가 대기
					setTimeout(() => {
						if (newReplyId) {
							const element = document.getElementById(`comment-${newReplyId}`)
							console.log('Looking for reply element:', `comment-${newReplyId}`, element)
							
							if (element) {
								element.scrollIntoView({ 
									behavior: 'smooth', 
									block: 'center' 
								})
								element.classList.add('highlight')
								
								setTimeout(() => {
									element.classList.remove('highlight')
								}, 2000)
							} else {
								// 재시도
								setTimeout(() => {
									const retryElement = document.getElementById(`comment-${newReplyId}`)
									if (retryElement) {
										retryElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
										retryElement.classList.add('highlight')
										setTimeout(() => retryElement.classList.remove('highlight'), 2000)
									}
								}, 500)
							}
						}
					}, 300)
				}, 500)
			} else {
				const error = await response.json()
				toast.error(error.error || '댓글 작성에 실패했습니다.')
			}
		} catch (err) {
			toast.error('댓글 작성 중 오류가 발생했습니다.')
		} finally {
			isSubmitting = false
		}
	}
	
	async function updateComment() {
		if (!editContent.trim() || isSubmitting) return
		
		isSubmitting = true
		try {
			const response = await fetch(`/api/comments/${comment.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					content: editContent
				})
			})
			
			if (response.ok) {
				// 실시간 업데이트가 자동으로 처리
				showReplyForm = false
				replyContent = ''
				isEditing = false
				editContent = comment.content
				toast.success('댓글이 수정되었습니다.')
				
				// 페이지 데이터 새로고침
				setTimeout(() => {
					invalidateAll()
				}, 500)
			} else {
				const error = await response.json()
				toast.error(error.error || '댓글 수정에 실패했습니다.')
			}
		} catch (err) {
			toast.error('댓글 수정 중 오류가 발생했습니다.')
		} finally {
			isSubmitting = false
		}
	}
	
	async function deleteComment() {
		if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) return
		
		isDeleting = true
		try {
			const response = await fetch(`/api/comments/${comment.id}`, {
				method: 'DELETE'
			})
			
			if (response.ok) {
				// 실시간 업데이트가 자동으로 처리
				showReplyForm = false
				replyContent = ''
				isEditing = false
				editContent = comment.content
				
				// 성공 메시지 표시
				toast.success('댓글이 삭제되었습니다.')
				
				// 페이지 데이터 새로고침 (부드러운 리로드)
				setTimeout(() => {
					invalidateAll()
				}, 500)
			} else {
				const error = await response.json()
				toast.error(error.error || '댓글 삭제에 실패했습니다.')
			}
		} catch (err) {
			toast.error('댓글 삭제 중 오류가 발생했습니다.')
		} finally {
			isDeleting = false
		}
	}
</script>

<div class="comment-item" id="comment-{comment.id}" style="margin-left: {level * 20}px;">
	<div class="comment-header">
		<div class="author-info">
			<img 
				src={imageError || !comment.author.avatar_url 
					? `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author.username || 'Unknown')}&background=6366f1&color=fff` 
					: comment.author.avatar_url} 
				alt={comment.author.username || 'Unknown'}
				class="author-avatar"
				onerror={handleImageError}
			/>
			<span class="author-name">{comment.author.username}</span>
		</div>
		<div class="comment-meta">
			<span class="comment-date">{formatDate(comment.created_at)}</span>
			{#if comment.is_edited}
				<span class="edited-mark">(수정됨)</span>
			{/if}
		</div>
	</div>
	
	<div class="comment-body">
		{#if level > 0}
			<span class="reply-arrow">└</span>
		{/if}
		{#if isEditing}
			<div class="edit-form">
				<textarea
					bind:value={editContent}
					rows="3"
					disabled={isSubmitting}
					onkeydown={(e) => {
						if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
							e.preventDefault()
							updateComment()
						}
					}}
				></textarea>
				<div class="edit-actions">
					<button 
						class="submit-btn"
						onclick={updateComment}
						disabled={!editContent.trim() || isSubmitting}
					>
						{isSubmitting ? '수정 중...' : '수정 완료'}
					</button>
					<button 
						class="cancel-btn"
						onclick={() => {
							isEditing = false
							editContent = comment.content
						}}
						disabled={isSubmitting}
					>
						취소
					</button>
				</div>
			</div>
		{:else}
			<p class="comment-content">{comment.content}</p>
		{/if}
	</div>
	
	<div class="comment-actions">
		{#if currentUserId && !isEditing}
			<button 
				class="action-btn"
				onclick={() => showReplyForm = !showReplyForm}
			>
				답글
			</button>
		{/if}
		{#if (currentUserId === comment.author_id || isAdmin) && !isEditing}
			<button 
				class="action-btn"
				onclick={() => {
					isEditing = true
					editContent = comment.content
				}}
			>
				수정
			</button>
			<button 
				class="action-btn"
				onclick={deleteComment}
				disabled={isDeleting}
			>
				{isDeleting ? '삭제 중...' : '삭제'}
			</button>
		{/if}
	</div>
	
	{#if showReplyForm}
		<div class="reply-form">
			<textarea
				bind:value={replyContent}
				placeholder="답글을 입력하세요..."
				rows="3"
				disabled={isSubmitting}
				onkeydown={(e) => {
					if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
						e.preventDefault()
						submitReply()
					}
				}}
			></textarea>
			<div class="reply-actions">
				<button 
					class="submit-btn"
					onclick={submitReply}
					disabled={!replyContent.trim() || isSubmitting}
				>
					{isSubmitting ? '작성 중...' : '답글 작성'}
				</button>
				<button 
					class="cancel-btn"
					onclick={() => {
						showReplyForm = false
						replyContent = ''
					}}
					disabled={isSubmitting}
				>
					취소
				</button>
			</div>
		</div>
	{/if}
	
	<!-- 대댓글 렌더링 -->
	{#if comment.replies && comment.replies.length > 0}
		{#each comment.replies as reply}
			<svelte:self 
				comment={reply} 
				level={level + 1} 
				{postId} 
				{currentUserId}
				{isAdmin}
			/>
		{/each}
	{/if}
</div>

<style>
	.comment-item {
		border-bottom: 1px solid #e5e7eb;
		padding: 1rem 0;
		transition: all 0.3s ease;
		scroll-margin-top: 100px;
	}
	
	:global(.comment-item.highlight) {
		background-color: #fef3c7 !important;
		padding: 1rem !important;
		border-radius: 0.5rem !important;
		border: 1px solid #f59e0b !important;
		box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2) !important;
	}
	
	.comment-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}
	
	.author-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	
	.author-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
	}
	
	.author-name {
		font-weight: 600;
		color: #1f2937;
	}
	
	.comment-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: #6b7280;
	}
	
	.edited-mark {
		color: #9ca3af;
	}
	
	.comment-body {
		display: flex;
		align-items: start;
		gap: 0.5rem;
	}
	
	.reply-arrow {
		color: #9ca3af;
		font-size: 1.2rem;
		line-height: 1.5rem;
	}
	
	.comment-content {
		flex: 1;
		color: #374151;
		line-height: 1.5;
		margin: 0;
	}
	
	.comment-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}
	
	.action-btn {
		padding: 0.25rem 0.5rem;
		font-size: 0.875rem;
		color: #6b7280;
		background: none;
		border: 1px solid #e5e7eb;
		border-radius: 0.25rem;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.action-btn:hover {
		background-color: #f3f4f6;
		color: #374151;
	}
	
	.reply-form {
		margin-top: 0.5rem;
		padding: 0.5rem;
		background-color: #f9fafb;
		border-radius: 0.25rem;
	}
	
	.reply-form textarea {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.25rem;
		resize: vertical;
	}
	
	.reply-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.5rem;
		justify-content: flex-end;
	}
	
	.submit-btn {
		padding: 0.375rem 1rem;
		background-color: #6366f1;
		color: white;
		border: none;
		border-radius: 0.25rem;
		font-size: 0.875rem;
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
	
	.cancel-btn {
		padding: 0.375rem 1rem;
		background-color: #e5e7eb;
		color: #374151;
		border: none;
		border-radius: 0.25rem;
		font-size: 0.875rem;
		cursor: pointer;
		transition: background-color 0.2s;
	}
	
	.cancel-btn:hover:not(:disabled) {
		background-color: #d1d5db;
	}
	
	.cancel-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.edit-form {
		flex: 1;
	}
	
	.edit-form textarea {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.25rem;
		resize: vertical;
		font-family: inherit;
		font-size: inherit;
		line-height: 1.5;
	}
	
	.edit-form textarea:focus {
		outline: none;
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}
	
	.edit-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.5rem;
		justify-content: flex-end;
	}
</style>