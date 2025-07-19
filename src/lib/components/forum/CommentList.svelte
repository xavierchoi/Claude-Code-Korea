<script lang="ts">
	import type { CommentWithReplies } from '$lib/types/comment'
	import CommentItem from './CommentItem.svelte'
	import { countAllComments } from '$lib/utils/comments'
	import { getContext, onMount } from 'svelte'
	import type { SupabaseClient } from '@supabase/supabase-js'
	import { toast } from '$lib/stores/toast'
	import { invalidateAll } from '$app/navigation'
	
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
	
	// 댓글 스토어 직접 사용
	import { commentStore } from '$lib/stores/comments'
	
	// 현재 사용자 정보 캐시
	let currentUserProfile: any = null
	
	// 페이지 로드 시 스크롤 처리
	onMount(() => {
		const scrollToCommentId = sessionStorage.getItem('scrollToComment')
		if (scrollToCommentId) {
			sessionStorage.removeItem('scrollToComment')
			console.log('Found scrollToComment in sessionStorage:', scrollToCommentId)
			
			// DOM이 완전히 로드된 후 스크롤
			setTimeout(() => {
				const element = document.getElementById(`comment-${scrollToCommentId}`)
				console.log('Looking for element:', `comment-${scrollToCommentId}`, element)
				
				if (element) {
					element.scrollIntoView({ 
						behavior: 'smooth', 
						block: 'center' 
					})
					element.classList.add('highlight')
					console.log('Scrolled and highlighted element')
					
					setTimeout(() => {
						element.classList.remove('highlight')
					}, 2000)
				}
			}, 500)
		}
	})
	
	// 초기 댓글 설정 및 실시간 구독
	$effect(() => {
		console.log('Setting up comments and realtime subscription for post:', postId)
		
		// 현재 사용자 프로필 정보 미리 캐시 (비동기 처리)
		console.log('Current user ID for caching:', currentUserId)
		async function cacheUserProfile() {
			if (currentUserId) {
				try {
					console.log('Attempting to cache profile for user:', currentUserId)
					const { data, error } = await supabase
						.from('profiles')
						.select('id, username, full_name, avatar_url')
						.eq('id', currentUserId)
						.single()
					
					console.log('Profile cache result:', { data, error })
					if (data) {
						currentUserProfile = data
						console.log('Successfully cached current user profile:', currentUserProfile)
					} else {
						console.error('Failed to cache user profile:', error)
					}
				} catch (err) {
					console.error('Error caching user profile:', err)
				}
			} else {
				console.log('No current user ID, skipping profile cache')
			}
		}
		
		// 프로필 캐시를 즉시 실행
		cacheUserProfile()
		
		// 초기 댓글 설정
		if (initialComments && initialComments.length > 0) {
			// initialComments가 이미 계층 구조인지 확인
			if (initialComments[0] && 'replies' in initialComments[0]) {
				// 이미 계층 구조로 되어있으면 직접 설정
				commentStore.update(store => ({
					...store,
					comments: initialComments as CommentWithReplies[],
					totalCount: countAllComments(initialComments as CommentWithReplies[])
				}))
			} else {
				// 플랫 배열이면 setComments 사용
				commentStore.setComments(initialComments)
			}
		} else {
			// 초기 댓글이 없으면 빈 배열로 설정
			commentStore.update(store => ({
				...store,
				comments: [],
				totalCount: 0
			}))
		}
		
		// 실시간 구독 설정
		let isSubscribed = false
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
					const eventTime = Date.now()
					console.log('New comment received at:', eventTime)
					console.log('Full payload:', JSON.stringify(payload, null, 2))
					console.log('Comment ID from payload:', payload.new?.id)
					console.log('Comment content from payload:', payload.new?.content)
					console.log('Post ID from payload:', payload.new?.post_id)
					console.log('Author ID from payload:', payload.new?.author_id)
					
					if (!payload.new?.id) {
						console.error('No comment ID in payload')
						return
					}
					
					// 현재 사용자의 댓글인 경우 실시간 이벤트에서는 무시 (API 응답에서 이미 처리됨)
					console.log('Comparing author IDs:')
					console.log('payload.new.author_id:', payload.new.author_id)
					console.log('currentUserId:', currentUserId)
					console.log('Are equal?', payload.new.author_id === currentUserId)
					
					if (payload.new.author_id === currentUserId) {
						console.log('Current user comment in realtime - skipping (already handled by API response)')
						return
					}
					
					// 다른 사용자의 댓글인 경우에만 fetch
					console.log('Fetching comment with ID:', payload.new.id)
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
					
					console.log('Fetch comment result:')
					console.log('Comment data:', comment)
					console.log('Error:', error)
					
					if (error) {
						console.error('Failed to fetch comment author:', error)
						// Fallback: payload의 데이터로 기본 댓글 객체 생성
						const fallbackComment = {
							...payload.new,
							author: {
								id: payload.new.author_id,
								username: 'Unknown',
								full_name: 'Unknown User',
								avatar_url: null
							}
						} as any
						console.log('Using fallback comment:', fallbackComment)
						commentStore.addComment(fallbackComment)
					} else if (comment) {
						const addTime = Date.now()
						console.log('Adding comment to store at:', addTime)
						console.log('Total time from event to store:', addTime - eventTime, 'ms')
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
					
					// 소프트 삭제된 경우
					if (payload.new.is_deleted) {
						console.log('Comment was soft deleted:', payload.new.id)
						commentStore.removeComment(payload.new.id)
						return
					}
					
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
		
		// 정리 함수
		return () => {
			console.log('Cleaning up realtime subscription for post:', postId)
			if (channel) {
				channel.unsubscribe()
			}
			commentStore.reset()
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
				const result = await response.json()
				console.log('Comment API response:', result)
				
				// 댓글 작성 시각 기록
				const submitTime = Date.now()
				console.log('Comment submitted at:', submitTime)
				
				// 새 댓글 ID 저장
				const newCommentId = result.comment?.id
				
				// 현재 사용자 댓글은 API 응답 데이터를 즉시 사용
				if (result.comment && result.comment.author_id === currentUserId) {
					console.log('Current user comment from API - adding immediately with correct profile')
					commentStore.addComment(result.comment)
				} else {
					// 다른 사용자 댓글인 경우만 실시간 업데이트 대기
					const realtimeTimeout = setTimeout(() => {
						const timeoutTime = Date.now()
						console.log(`Realtime update timeout after ${timeoutTime - submitTime}ms, adding comment directly`)
						if (result.comment) {
							commentStore.addComment(result.comment)
						}
					}, 500)
					
					// 실시간 업데이트가 오면 timeout 취소
					const unsubscribe = commentStore.subscribe((store) => {
						if (store.comments.some(c => c.id === result.comment?.id)) {
							const realtimeTime = Date.now()
							console.log(`Realtime update received after ${realtimeTime - submitTime}ms, canceling timeout`)
							clearTimeout(realtimeTimeout)
							unsubscribe()
						}
					})
				}
				
				newCommentContent = ''
				console.log('Comment submitted successfully, waiting for realtime update...')
				toast.success('댓글이 작성되었습니다.')
				
				// 페이지 데이터 새로고침 후 스크롤
				setTimeout(async () => {
					console.log('Starting invalidateAll for new comment:', newCommentId)
					await invalidateAll()
					console.log('invalidateAll completed')
					
					// DOM 업데이트를 위한 추가 대기
					setTimeout(() => {
						if (newCommentId) {
							console.log('Looking for element with ID:', `comment-${newCommentId}`)
							
							// 디버깅: 모든 comment-item 출력
							const allComments = document.querySelectorAll('.comment-item')
							console.log('All comment elements:', allComments.length)
							allComments.forEach(el => {
								console.log('Comment element ID:', el.id)
							})
							
							const element = document.getElementById(`comment-${newCommentId}`)
							console.log('Found element by ID:', element)
							
							// querySelector로도 시도
							const element2 = document.querySelector(`#comment-${newCommentId}`)
							console.log('Found element by querySelector:', element2)
							
							if (element) {
								console.log('Scrolling to element and adding highlight')
								console.log('Element position before scroll:', element.getBoundingClientRect())
								console.log('Window scroll Y before:', window.scrollY)
								
								element.scrollIntoView({ 
									behavior: 'smooth', 
									block: 'center' 
								})
								
								// 하이라이트 효과
								element.classList.add('highlight')
								console.log('Element classes after highlight:', element.className)
								
								// 스크롤 확인
								setTimeout(() => {
									console.log('Window scroll Y after:', window.scrollY)
									console.log('Element position after scroll:', element.getBoundingClientRect())
								}, 1000)
								
								setTimeout(() => {
									element.classList.remove('highlight')
								}, 2000)
							} else {
								console.error('Comment element not found in DOM')
								// 재시도
								setTimeout(() => {
									const retryElement = document.getElementById(`comment-${newCommentId}`)
									if (retryElement) {
										console.log('Found element on retry')
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
				console.error('Comment submission failed:', error)
				toast.error(error.error || '댓글 작성에 실패했습니다.')
			}
		} catch (err) {
			toast.error('댓글 작성 중 오류가 발생했습니다.')
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
				onkeydown={(e) => {
					if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
						e.preventDefault()
						submitComment()
					}
				}}
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