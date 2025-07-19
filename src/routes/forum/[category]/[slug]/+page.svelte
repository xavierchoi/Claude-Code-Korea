<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { renderMarkdown } from '$lib/utils/markdown.client';
	import type { PageData } from './$types';
	import CommentList from '$lib/components/forum/CommentList.svelte';
	
	let { data }: { data: PageData } = $props();
	
	let renderedContent = '';
	let isDeleting = false;
	
	// 마크다운 렌더링
	onMount(() => {
		if (data.post.content) {
			renderedContent = renderMarkdown(data.post.content);
		}
	});
	
	// 날짜 포맷
	function formatDate(date: string) {
		const d = new Date(date);
		return d.toLocaleDateString('ko-KR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
	
	// 게시글 삭제
	async function handleDelete() {
		if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
			return;
		}
		
		isDeleting = true;
		
		try {
			const response = await fetch(`/api/posts/${data.post.id}`, {
				method: 'DELETE'
			});
			
			if (!response.ok) {
				throw new Error('게시글 삭제에 실패했습니다.');
			}
			
			// 포럼 목록으로 이동
			goto('/forum');
		} catch (err) {
			alert(err instanceof Error ? err.message : '오류가 발생했습니다.');
			isDeleting = false;
		}
	}
</script>

<div class="container mx-auto px-4 py-8 max-w-4xl">
	<!-- 게시글 헤더 -->
	<article class="bg-white rounded-lg shadow-sm overflow-hidden">
		<div class="p-6">
			<!-- 카테고리 및 메타 정보 -->
			<div class="flex items-center gap-2 mb-4">
				<a 
					href="/forum?category={data.post.category.slug}"
					class="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200"
				>
					{data.post.category.icon} {data.post.category.name}
				</a>
				{#if data.post.is_pinned}
					<span class="text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full">
						고정
					</span>
				{/if}
				{#if data.post.is_locked}
					<span class="text-sm font-medium text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
						잠김 🔒
					</span>
				{/if}
				{#if !data.post.is_published}
					<span class="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
						임시 저장
					</span>
				{/if}
			</div>
			
			<!-- 제목 -->
			<h1 class="text-3xl font-bold mb-4">{data.post.title}</h1>
			
			<!-- 작성자 정보 -->
			<div class="flex items-center justify-between mb-6 pb-6 border-b">
				<div class="flex items-center gap-3">
					{#if data.post.author.avatar_url}
						<img
							src={data.post.author.avatar_url}
							alt={data.post.author.username}
							class="w-12 h-12 rounded-full"
						/>
					{:else}
						<div class="w-12 h-12 rounded-full bg-gray-300"></div>
					{/if}
					<div>
						<a 
							href="/user/{data.post.author.username}"
							class="font-medium hover:text-blue-600"
						>
							{data.post.author.full_name || data.post.author.username}
						</a>
						<div class="text-sm text-gray-500">
							{formatDate(data.post.created_at)}
							{#if data.post.updated_at !== data.post.created_at}
								<span class="ml-2">(수정됨)</span>
							{/if}
						</div>
					</div>
				</div>
				
				<!-- 작성자 본인 또는 관리자일 경우 수정/삭제 버튼 -->
				{#if data.isAuthor || data.isAdmin}
					<div class="flex gap-2">
						<a
							href="/posts/edit/{data.post.id}"
							class="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
						>
							수정
						</a>
						<button
							on:click={handleDelete}
							disabled={isDeleting}
							class="px-3 py-1 text-sm text-red-600 bg-red-50 rounded hover:bg-red-100 disabled:opacity-50"
						>
							{isDeleting ? '삭제 중...' : '삭제'}
						</button>
					</div>
				{/if}
			</div>
			
			<!-- 통계 정보 -->
			<div class="flex items-center gap-6 text-sm text-gray-500 mb-6">
				<span>조회 {data.post.view_count}</span>
				<span>좋아요 {data.post.like_count}</span>
				<span>댓글 {data.post.comment_count}</span>
			</div>
			
			<!-- 본문 내용 -->
			<div class="prose prose-lg max-w-none">
				{@html renderedContent}
			</div>
		</div>
		
		<!-- 하단 액션 -->
		<div class="bg-gray-50 px-6 py-4 flex items-center justify-between">
			<div class="flex items-center gap-4">
				<button
					class="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
				>
					<span>👍</span>
					<span>좋아요</span>
					<span class="font-medium">{data.post.like_count}</span>
				</button>
				
				<button
					class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
				>
					공유
				</button>
			</div>
			
			<a
				href="/forum"
				class="text-sm text-gray-600 hover:text-gray-900"
			>
				목록으로
			</a>
		</div>
	</article>
	
	<!-- 댓글 섹션 -->
	{#if !data.post.is_locked}
		<CommentList 
			comments={data.comments || []}
			postId={data.post.id}
			currentUserId={data.session?.user?.id}
			isLoggedIn={!!data.session}
			isAdmin={data.isAdmin}
		/>
	{:else}
		<section class="mt-8">
			<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
				이 게시글은 잠겨있어 댓글을 작성할 수 없습니다.
			</div>
		</section>
	{/if}
</div>